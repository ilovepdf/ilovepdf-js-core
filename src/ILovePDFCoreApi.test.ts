import dotenv from 'dotenv';
import ILovePDFCoreApi, { UpdateSignerData } from './ILovePDFCoreApi';
import XHRPromise from './utils/XHRPromise';
import JWT from './auth/JWT';
import TaskFactory from './tasks/TaskFactory';
import SignTask from './tasks/sign/SignTask';
import SignatureFile from './tasks/sign/SignatureFile';
import Signer from './tasks/sign/Signer';

// Load env vars.
dotenv.config();

const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('ILovePDFCoreApi', () => {
    let task: SignTask;

    beforeEach(() => {
        // Create sign task to create a signer in servers.
        const taskFactory = new TaskFactory();

        task = taskFactory.newTask('sign', auth, xhr) as SignTask;
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

    it('updates a Signer', () => {
        const { token } = task.signers[0];

        const data: UpdateSignerData = {
            name: 'Pepito'
        };

        return ILovePDFCoreApi.updateSigner(auth, xhr, token, data)
        .then(response => {
            response.name === data.name;
        });
    });

});