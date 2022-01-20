import SignTask from "./SignTask";
import dotenv from 'dotenv';
import TaskFactory from "../TaskFactory";
import XHRPromise from "../../utils/XHRPromise";
import JWT from "../../auth/JWT";
import SignatureFile from "./SignatureFile";
import Signer from "./receivers/Signer";
import ILovePDFCoreApi from "../../ILovePDFCoreApi";

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('SignTask', () => {

    it('requests signatures', async () => {
        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        return task.start()
        .then(() => {
            return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        })
        .then((file) => {
            // Signer.
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
            task.addReceiver(signer);

            return task.process({
                mode: 'multiple',
                custom_int: 0,
                custom_string: '0'
            });
        })
        .then(() => {
            const response = task.responses.process!;
            // Assert that files were uploaded.
            expect(response[0].signers[0].files).not.toBeNull();
        });
    });

});