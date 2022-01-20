import dotenv from 'dotenv';
import XHRPromise from './utils/XHRPromise';
import JWT from './auth/JWT';
import TaskFactory from './tasks/TaskFactory';
import SignTask from './tasks/sign/SignTask';
import SignatureFile from './tasks/sign/SignatureFile';
import Signer from './tasks/sign/Signer';
import CompressTask from './tasks/CompressTask';
import ILovePDFFile from './utils/ILovePDFFile';
import { inRange } from './utils/math';
import path, { resolve } from 'path';
import ILovePDFCoreApi from './ILovePDFCoreApi';

// Load env vars.
dotenv.config();

const xhr = new XHRPromise();

describe('ILovePDFCoreApi', () => {

    describe('file_encryption_key', () => {

        it('sets file_encryption_key in a task with normal process', async () => {
            const taskFactory = new TaskFactory();

            const auth = new JWT(xhr,
                                 process.env.PUBLIC_KEY!,
                                 process.env.SECRET_KEY!,
                                 {
                                     file_encryption_key: '0123456789012345'
                                 });

            const task = taskFactory.newTask('compress', auth, xhr) as CompressTask;

            await task.start()

            const file = new ILovePDFFile(path.resolve(__dirname, './tests/input/sample.pdf'));
            await task.addFile(file);

            await task.process({ compression_level: 'low' });

            const data = await task.download();

            console.log(`Length: ${ data.length }`);
            expect( inRange(data.length, 1697, 5) ).toBeTruthy();
        });

        it('sets file_encryption_key in a task with signature process without getting errors', () => {
            const taskFactory = new TaskFactory();

            const auth = new JWT(xhr,
                                 process.env.PUBLIC_KEY!,
                                 process.env.SECRET_KEY!,
                                 {
                                     file_encryption_key: '0123456789012345'
                                 });

            const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

            return task.start()
            .then(() => {
                return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
            })
            .then((file) => {
                // Requester.
                task.requester = {
                    name: 'Diego',
                    email: 'invent@ado.com'
                };

                // Signer.
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

                return task.process({
                    mode: 'single',
                    custom_int: 0,
                    custom_string: '0'
                });
            });
        });

    });

    it('gets a signature status', async () => {
        // Create sign task to create a signer in servers.
        const taskFactory = new TaskFactory();

        const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        await task.start()

        const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Requester.
        task.requester = {
            name: 'Diego',
            email: 'req@ester.com'
        };

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
        task.addSigner(signer);

        await task.process({
            mode: 'multiple',
            custom_int: 0,
            custom_string: '0'
        });

        const { signers } = await ILovePDFCoreApi.getSignatureStatus(auth, xhr, task.token);

        expect( signers[0].email ).toBe('invent@ado.com');
    });

    it('gets a signature list', async () => {
        // Create sign task to create a signer in servers.
        const taskFactory = new TaskFactory();

        const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

        // First task.

        let task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        await task.start()

        let file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Requester.
        task.requester = {
            name: 'Diego',
            email: 'req@ester.com'
        };

        // Signer.
        let signatureFile = new SignatureFile(file, [{
            type: 'signature',
            position: '300 -100',
            pages: '1',
            size: 28,
            color: '#000000',
            font: null as unknown as string,
            content: null as unknown as string
        }]);

        let signer = new Signer('Manolo', 'invent@ado.com', {
            type: 'signer',
            force_signature_type: 'all'
        });
        signer.addFile(signatureFile);
        task.addSigner(signer);

        await task.process({
            mode: 'multiple',
            custom_int: 0,
            custom_string: '0'
        });

        // Second task.

        task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        await task.start()

        file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Requester.
        task.requester = {
            name: 'Diego',
            email: 'req@ester.com'
        };

        // Signer.
        signatureFile = new SignatureFile(file, [{
            type: 'signature',
            position: '300 -100',
            pages: '1',
            size: 28,
            color: '#000000',
            font: null as unknown as string,
            content: null as unknown as string
        }]);

        signer = new Signer('Paquito', 'invent@ado.com', {
            type: 'signer',
            force_signature_type: 'all'
        });
        signer.addFile(signatureFile);
        task.addSigner(signer);

        await task.process({
            mode: 'multiple',
            custom_int: 0,
            custom_string: '0'
        });

        const signatureList = await ILovePDFCoreApi.getSignatureList(auth, xhr, 0, 2);

        const paquitoName = signatureList[0].signers[0].name;

        const manoloName = signatureList[1].signers[0].name;

        expect( paquitoName ).toBe('Paquito');
        expect( manoloName ).toBe('Manolo');
    });

    it('voids a signature', async () => {
        // Create sign task to create a signer in servers.
        const taskFactory = new TaskFactory();

        const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        await task.start()

        const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Requester.
        task.requester = {
            name: 'Diego',
            email: 'req@ester.com'
        };

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
        task.addSigner(signer);

        await task.process({
            mode: 'multiple',
            custom_int: 0,
            custom_string: '0'
        });

        // Wait to send emails due to this is made
        // in background.
        await new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, 2000);
        });

        // Void signature and look that it is correctly invalidated.
        await ILovePDFCoreApi.voidSignature(auth, xhr, task.token);

        const { status } = await ILovePDFCoreApi.getSignatureStatus( auth, xhr, task.token );

        expect(status).toBe('void');
    });

    it('increases a signature expiration days', async () => {
        // Create sign task to create a signer in servers.
        const taskFactory = new TaskFactory();

        const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        await task.start()

        const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Requester.
        task.requester = {
            name: 'Diego',
            email: 'req@ester.com'
        };

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
        task.addSigner(signer);

        await task.process({
            mode: 'multiple',
            custom_int: 0,
            custom_string: '0'
        });

        // Increase expiration days.
        const INCREASED_DAYS = 3;
        await ILovePDFCoreApi.increaseSignatureExpirationDays(auth, xhr, task.token, INCREASED_DAYS);

        const { created, expires } = await ILovePDFCoreApi.getSignatureStatus( auth, xhr, task.token );

        const creationDate = new Date( created );
        const expirationDate = new Date( expires );

        const diffDays = dateDiffInDays(creationDate, expirationDate);

        // Days by default.
        const BASE_DAYS = 120;

        expect(diffDays).toBe(BASE_DAYS + INCREASED_DAYS);
    });

    it('sends reminders', async () => {
        // Create sign task to create a signer in servers.
        const taskFactory = new TaskFactory();

        const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        await task.start()

        const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Requester.
        task.requester = {
            name: 'Diego',
            email: 'req@ester.com'
        };

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
        task.addSigner(signer);

        await task.process({
            mode: 'multiple',
            custom_int: 0,
            custom_string: '0'
        });

        // Wait to send emails due to this is made
        // in background.
        await new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, 2000);
        });

        // Due to we can test that email was sent, a limit exception is forced.
        await ILovePDFCoreApi.sendReminders(auth, xhr, task.token);
        await ILovePDFCoreApi.sendReminders(auth, xhr, task.token);

        try {
            await ILovePDFCoreApi.sendReminders(auth, xhr, task.token);
            fail( 'it has to fail.' );
        }
        catch(err) {
            expect(err.message).toBe('Request failed with status code 400');
        }

    });

    it('downloads original files', async () => {
        // Create sign task to create a signer in servers.
        const taskFactory = new TaskFactory();

        const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        await task.start()

        const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Requester.
        task.requester = {
            name: 'Diego',
            email: 'req@ester.com'
        };

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
        task.addSigner(signer);

        await task.process({
            mode: 'multiple',
            custom_int: 0,
            custom_string: '0'
        });

        const rawData = await ILovePDFCoreApi.downloadOriginalFiles(auth, xhr, task.token);

        expect(rawData.length).toBeGreaterThan(0);
    });

    it('downloads signed files', async () => {
        // Create sign task to create a signer in servers.
        const taskFactory = new TaskFactory();

        const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        await task.start()

        const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Requester.
        task.requester = {
            name: 'Diego',
            email: 'req@ester.com'
        };

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
        task.addSigner(signer);

        await task.process({
            mode: 'multiple',
            custom_int: 0,
            custom_string: '0'
        });

        // We can't test downloaded data due to the signature is not finished.
        // But we want to test that the connection was successful, so the
        // exception is the trigger to know that the connection was successful.
        try {
            await ILovePDFCoreApi.downloadSignedFiles(auth, xhr, task.token);
            fail( 'it has to fail.' );
        }
        catch(err) {
            // Due to it was treated as binary data.
            const dataBuf = JSON.parse(err.response.data.toString());
            expect( dataBuf.error.message ).toBe('We can\'t serve the download. Audit trail is only ready when signature is completed');
        }

    });

    it('downloads audit files', async () => {
        // Create sign task to create a signer in servers.
        const taskFactory = new TaskFactory();

        const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        await task.start()

        const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Requester.
        task.requester = {
            name: 'Diego',
            email: 'req@ester.com'
        };

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
        task.addSigner(signer);

        await task.process({
            mode: 'multiple',
            custom_int: 0,
            custom_string: '0',
            certified: true,
        });

        // We can't test downloaded data due to the signature is not finished.
        // But we want to test that the connection was successful, so the
        // exception is the trigger to know that the connection was successful.
        try {
            await ILovePDFCoreApi.downloadAuditFiles(auth, xhr, task.token);
            fail( 'it has to fail.' );
        }
        catch(err) {
            // Due to it was treated as binary data.
            const dataBuf = JSON.parse(err.response.data.toString());
            expect( dataBuf.error.message ).toBe('We can\'t serve the download. Audit trail is only ready when signature is completed');
        }

    });

    it('gets receiver information', async () => {
        // Create sign task to create a signer in servers.
        const taskFactory = new TaskFactory();

        const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        await task.start()

        const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Requester.
        task.requester = {
            name: 'Diego',
            email: 'req@ester.com'
        };

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
        task.addSigner(signer);

        await task.process({
            mode: 'multiple',
            custom_int: 0,
            custom_string: '0'
        });

        // Due to we can test that email was sent, a limit exception is forced.
        const { name } = await ILovePDFCoreApi.getReceiverInfo(auth, xhr, signer.token_requester);

        expect(name).toBe('Diego Signer');
    });

    it('fix receiver email', async () => {
        // Create sign task to create a signer in servers.
        const taskFactory = new TaskFactory();

        const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        await task.start()

        const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Requester.
        task.requester = {
            name: 'Diego',
            email: 'req@ester.com'
        };

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
        task.addSigner(signer);

        await task.process({
            mode: 'multiple',
            custom_int: 0,
            custom_string: '0'
        });

        // Test that connection was established.
        try {
            await ILovePDFCoreApi.fixReceiverEmail(auth, xhr, signer.token_requester, 'newemail@email.com');
            fail( 'it has to fail.' );
        }
        catch(err) {
            // Due to it was treated as binary data.
            expect( err.response.data.error.param.email[0] ).toBe('Email does not need to be fixed');
        }

    });

    it('fix receiver phone', async () => {
        // Create sign task to create a signer in servers.
        const taskFactory = new TaskFactory();

        const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        await task.start()

        const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Requester.
        task.requester = {
            name: 'Diego',
            email: 'req@ester.com'
        };

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
        task.addSigner(signer);

        await task.process({
            mode: 'multiple',
            custom_int: 0,
            custom_string: '0'
        });

        // Test that connection was established.
        try {
            await ILovePDFCoreApi.fixReceiverPhone(auth, xhr, signer.token_requester, '34654654654');
            fail( 'it has to fail.' );
        }
        catch(err) {
            // Due to it was treated as binary data.
            expect( err.response.data.error.param.phone[0] ).toBe('Phone does not need to be fixed');
        }

    });

});

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function dateDiffInDays(a: Date, b: Date): number {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / MS_PER_DAY);
}