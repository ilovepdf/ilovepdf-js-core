import SignTask from "./SignTask";
import dotenv from 'dotenv';
import TaskFactory from "../TaskFactory";
import XHRPromise from "../../utils/XHRPromise";
import JWT from "../../auth/JWT";
import SignatureFile from "./elements/SignatureFile";
import Signer from "./receivers/Signer";
import ILovePDFFile from "../../utils/ILovePDFFile";
import path from "path";

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('SignTask', () => {

    it('requests signatures', async () => {
        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        await task.start();

        const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Signer.
        const signatureFile = new SignatureFile(file, [{
            type: 'signature',
            position: '300 -100',
            pages: '1',
            size: 40,
        }]);

        const signer = new Signer('Diego Signer', 'invent@ado.com');
        signer.addFile(signatureFile);
        task.addReceiver(signer);

        const response = await task.process();

        expect(response.signers[0].name).toBe('Diego Signer');
    });

    it('uses a file as brand logo', async () => {
        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        await task.start();

        const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Signer.
        const signatureFile = new SignatureFile(file, [{
            type: 'signature',
            position: '300 -100',
            pages: '1',
            size: 40,
        }]);

        const signer = new Signer('Diego Signer', 'invent@ado.com');
        signer.addFile(signatureFile);
        task.addReceiver(signer);

        const brandLogo = await task.addFile( new ILovePDFFile(path.resolve(__dirname, '../../tests/input/brand_logo.png')) );

        const response = await task.process({
            brand_name: 'TestCompany',
            brand_logo: brandLogo.serverFilename
        });

        expect(response.signers[0].name).toBe('Diego Signer');
    });

});
