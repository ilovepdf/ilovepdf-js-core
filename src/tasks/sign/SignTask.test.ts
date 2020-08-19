import SignTask from "./SignTask";
import dotenv from 'dotenv';
import TaskFactory from "../TaskFactory";
import XHRPromise from "../../utils/XHRPromise";
import JWT from "../../auth/JWT";
import SignatureFile from "./SignatureFile";
import Signer from "./Signer";

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('SignTask', () => {

    it('self signs', async () => {
        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        return task.start()
        .then(() => {
            return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        })
        .then(() => {
            // Requester.
            task.requester = {
                name: 'Diego',
                email: 'req@ester.com'
            };

            // Signer.
            const file = task.getFiles()[0];
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
                color: 'red',
                font: '',
                content: ''
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com');
            signer.addFile(signatureFile);
            task.addSigner(signer);

            return task.process();
        });

    });

    it('executes multiple signature requests', async () => {
        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        return task.start()
        .then(() => {
            return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        })
        .then(() => {
            // Requester.
            task.requester = {
                name: 'Diego',
                email: 'req@ester.com'
            };

            // Signer.
            const file = task.getFiles()[0];
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 28,
                color: '#000000',
                font: null as unknown as string,
                content: null as unknown as string
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addSigner(signer);

            return task.process({
                mode: 'multiple',
                custom_int: 0,
                custom_string: '0'
            });
        })
        .then(() => {
            const response = task.responses.process!;
            // Assert that files were uploaded.
            expect(response.signers[0].files).not.toBeNull();
        });

    });

    it('executes a signature batch request', () => {
        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        return task.start()
        .then(() => {
            return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        })
        .then(() => {
            return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        })
        .then(() => {
            // Requester.
            task.requester = {
                name: 'Diego',
                email: 'req@ester.com'
            };

            // Signer.
            const file = task.getFiles()[0];
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 28,
                color: '#000000',
                font: null as unknown as string,
                content: null as unknown as string
            }]);

            const signer = new Signer('Diego Signer', 'invent@ado.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            task.addSigner(signer);

            return task.process({
                mode: 'batch',
                batch_elements: [ signatureFile ],
                custom_int: 0,
                custom_string: '0'
            });
        })
        .then(() => {
            const response = task.responses.process!;
            // Assert that files were uploaded.
            expect(response.signers[0].files).not.toBeNull();
        });
    });

});