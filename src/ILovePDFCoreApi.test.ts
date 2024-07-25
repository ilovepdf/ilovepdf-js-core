import dotenv from 'dotenv';
import XHRPromise from './utils/XHRPromise';
import JWT from './auth/JWT';
import TaskFactory from './tasks/TaskFactory';
import SignTask from './tasks/sign/SignTask';
import SignatureFile from './tasks/sign/elements/SignatureFile';
import Signer from './tasks/sign/receivers/Signer';
import CompressTask from './tasks/CompressTask';
import ILovePDFFile from './utils/ILovePDFFile';
import path from 'path';
import ILovePDFCoreApi from './ILovePDFCoreApi';

// Load env vars.
dotenv.config();

const xhr = new XHRPromise();

describe('ILovePDFCoreApi', () => {

    describe('task properties', () => {
        it('gets the remaining files', async () => {
            const taskFactory = new TaskFactory();

            const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

            const task = taskFactory.newTask('compress', auth, xhr) as CompressTask;

            await task.start()

            // Be careful with this test. In case of being an admin, `remainingFiles`
            // is `undefined` due to they have no limits.
            expect( typeof task.remainingFiles === 'number' ).toBeTruthy()
        });

        it('does not get the pdfinfo', async () => {
            const taskFactory = new TaskFactory();

            const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

            const task = taskFactory.newTask('compress', auth, xhr) as CompressTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Be careful with this test. In case of being an admin, `remainingFiles`
            // is `undefined` due to they have no limits.
            expect(file.info).toBeUndefined()
        });

        it('does not get the pdfinfo with local file', async () => {
            const taskFactory = new TaskFactory();

            const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

            const task = taskFactory.newTask('compress', auth, xhr) as CompressTask;

            await task.start()

            const file = new ILovePDFFile(path.resolve(__dirname, './tests/input/sample.pdf'));
            await task.addFile(file, { info: false });

            // Be careful with this test. In case of being an admin, `remainingFiles`
            // is `undefined` due to they have no limits.
            expect(file.info).toBeUndefined()
        });

        it('does not get the pdfinfo if specified', async () => {
            const taskFactory = new TaskFactory();

            const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

            const task = taskFactory.newTask('compress', auth, xhr) as CompressTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', { info: false });

            // Be careful with this test. In case of being an admin, `remainingFiles`
            // is `undefined` due to they have no limits.
            expect(file.info).toBeUndefined()
        });

        it('gets the pdfinfo if specified', async () => {
            const taskFactory = new TaskFactory();

            const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

            const task = taskFactory.newTask('compress', auth, xhr) as CompressTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', { info: true });

            // Be careful with this test. In case of being an admin, `remainingFiles`
            // is `undefined` due to they have no limits.
            expect(file.info).toBeDefined()
        });

        it('gets the pdfinfo if specified with file', async () => {
            const taskFactory = new TaskFactory();

            const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

            const task = taskFactory.newTask('compress', auth, xhr) as CompressTask;

            await task.start()

            const file = new ILovePDFFile(path.resolve(__dirname, './tests/input/sample.pdf'));
            await task.addFile(file, { info: true });

            // Be careful with this test. In case of being an admin, `remainingFiles`
            // is `undefined` due to they have no limits.
            expect(file.info).toBeDefined()
        });
    })

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
            const expected = 1697
            const errorMargin = 200
            expect(data.length).toBeGreaterThan(expected - errorMargin)
            expect(data.length).toBeLessThan(expected + errorMargin)
        });

        // Note: This test is skipped due to it was not in consideration that
        // signature files could use this file_encryption_key parameter and
        // it is not implemented yet.
        it.skip('sets file_encryption_key in a task with signature process without getting errors', () => {
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
                // Signer.
                const signatureFile = new SignatureFile(file, [{
                    type: 'signature',
                    position: '300 -100',
                    pages: '1',
                    size: 40,
                }]);

                const signer = new Signer('Diego Signer', 'testfake@ilovepdf.com');
                signer.addFile(signatureFile);
                task.addReceiver(signer);

                return task.process();
            });
        });

    });

    describe('Signature management', () => {

        it('gets a signature status', async () => {
            // Create sign task to create a signer in servers.
            const taskFactory = new TaskFactory();

            const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

            const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'testfake@ilovepdf.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process();

            const { signers } = await ILovePDFCoreApi.getSignatureStatus(auth, xhr, token_requester);

            expect( signers[0].email ).toBe('testfake@ilovepdf.com');
        });

        it('gets a signature list', async () => {
            // Create sign task to create a signer in servers.
            const taskFactory = new TaskFactory();

            const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

            // First task.

            let task = taskFactory.newTask('sign', auth, xhr) as SignTask;

            await task.start()

            let file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            let signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            let signer = new Signer('Manolo', 'testfake@ilovepdf.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            await task.process();

            // Second task.

            task = taskFactory.newTask('sign', auth, xhr) as SignTask;

            await task.start()

            file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            signer = new Signer('Paquito', 'testfake@ilovepdf.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            await task.process();

            const signatureList = await ILovePDFCoreApi.getSignatureList(auth, xhr, 0, 2, {sort_direction: 'desc'});

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

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'testfake@ilovepdf.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process();

            // Wait to send emails due to this is made
            // in background.
            await new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve();
                }, 2000);
            });

            // Void signature and look that it is correctly invalidated.
            await ILovePDFCoreApi.voidSignature(auth, xhr, token_requester);

            const { status } = await ILovePDFCoreApi.getSignatureStatus( auth, xhr, token_requester );

            expect(status).toBe('void');
        });

        it('increases a signature expiration days', async () => {
            // Create sign task to create a signer in servers.
            const taskFactory = new TaskFactory();

            const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

            const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'testfake@ilovepdf.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const BASE_DAYS = 120;
            const { token_requester } = await task.process({expiration_days: BASE_DAYS});

            // Increase expiration days.
            const INCREASED_DAYS = 3;
            await ILovePDFCoreApi.increaseSignatureExpirationDays(auth, xhr, token_requester, INCREASED_DAYS);

            const { created, expires } = await ILovePDFCoreApi.getSignatureStatus( auth, xhr, token_requester );

            const creationDate = new Date( created );
            const expirationDate = new Date( expires );

            const diffDays = dateDiffInDays(creationDate, expirationDate);

            // Days by default.

            expect(diffDays).toBe(BASE_DAYS + INCREASED_DAYS);
        });

        it('sends reminders', async () => {
            // Create sign task to create a signer in servers.
            const taskFactory = new TaskFactory();

            const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

            const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'testfake@ilovepdf.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process();

            // Wait to send emails due to this is made
            // in background.
            await new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve();
                }, 2000);
            });

            await ILovePDFCoreApi.sendReminders(auth, xhr, token_requester);
        });
        
        it('downloads original files', async () => {
            // Create sign task to create a signer in servers.
            const taskFactory = new TaskFactory();

            const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

            const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'testfake@ilovepdf.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process();

            const rawData = await ILovePDFCoreApi.downloadOriginalFiles(auth, xhr, token_requester);

            expect(rawData.length).toBeGreaterThan(0);
        });

        it('downloads signed files', async () => {
            // Create sign task to create a signer in servers.
            const taskFactory = new TaskFactory();

            const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

            const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'testfake@ilovepdf.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process();

            // We can't test downloaded data due to the signature is not finished.
            // But we want to test that the connection was successful, so the
            // exception is the trigger to know that the connection was successful.
            try {
                await ILovePDFCoreApi.downloadSignedFiles(auth, xhr, token_requester);
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

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'testfake@ilovepdf.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const { token_requester } = await task.process();

            // We can't test downloaded data due to the signature is not finished.
            // But we want to test that the connection was successful, so the
            // exception is the trigger to know that the connection was successful.
            try {
                await ILovePDFCoreApi.downloadAuditFiles(auth, xhr, token_requester);
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

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'testfake@ilovepdf.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const result = await task.process();

            const processedSigner = result.signers[0];
            const { token_requester } = processedSigner;

            // Due to we can test that email was sent, a limit exception is forced.
            const { name } = await ILovePDFCoreApi.getReceiverInfo(auth, xhr, token_requester);

            expect(name).toBe('Diego Signer');
        });

        it('fix receiver email', async () => {
            // Create sign task to create a signer in servers.
            const taskFactory = new TaskFactory();

            const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

            const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

            await task.start()

            const file = await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'testfake@ilovepdf.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const result = await task.process();

            const processedSigner = result.signers[0];
            const { token_requester } = processedSigner;

            // Test that connection was established.
            try {
                await ILovePDFCoreApi.fixReceiverEmail(auth, xhr, token_requester, 'newemail@email.com');
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

            // Signer.
            const signatureFile = new SignatureFile(file, [{
                type: 'signature',
                position: '300 -100',
                pages: '1',
                size: 40,
            }]);

            const signer = new Signer('Diego Signer', 'testfake@ilovepdf.com', {
                type: 'signer',
                force_signature_type: 'all'
            });
            signer.addFile(signatureFile);
            task.addReceiver(signer);

            const result = await task.process();

            const processedSigner = result.signers[0];
            const { token_requester } = processedSigner;

            // Test that connection was established.
            try {
                await ILovePDFCoreApi.fixReceiverPhone(auth, xhr, token_requester, '34654654654');
                fail( 'it has to fail.' );
            }
            catch(err) {
                // Due to it was treated as binary data.
                expect( err.response.data.error.param.phone[0] ).toBe('Phone does not need to be fixed');
            }

        });

    });

});

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function dateDiffInDays(a: Date, b: Date): number {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / MS_PER_DAY);
}
