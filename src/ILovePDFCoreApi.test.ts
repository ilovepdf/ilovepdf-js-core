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

        it('sets file_encryption_key in a task with normal process', () => {
            const taskFactory = new TaskFactory();

            const auth = new JWT(xhr,
                                 process.env.PUBLIC_KEY!,
                                 process.env.SECRET_KEY!,
                                 {
                                     file_encryption_key: '0123456789012345'
                                 });

            const task = taskFactory.newTask('compress', auth, xhr) as CompressTask;

            return task.start()
            .then(() => {
                const file = new ILovePDFFile(path.resolve(__dirname, './tests/input/sample.pdf'));
                return task.addFile(file);
            })
            .then(() => {
                return task.process({ compression_level: 'low' });
            })
            .then(() => {
                return task.download();
            })
            .then(data => {
                console.log(`Length: ${ data.length }`);
                expect( inRange(data.length, 1697, 5) ).toBeTruthy();
            });
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
            .then(() => {
                // Requester.
                task.requester = {
                    name: 'Diego',
                    email: 'invent@ado.com'
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

                return task.process({
                    mode: 'single',
                    custom_int: 0,
                    custom_string: '0'
                });
            });
        });

    });

    it('gets a signature task', () => {
        // Create sign task to create a signer in servers.
        const taskFactory = new TaskFactory();

        const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

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
        .then(async () => {
            const signTask = await ILovePDFCoreApi.getSignature(auth, xhr, task.token);
            expect(signTask.token).toBe(task.token);
        });
    });

    it('gets a signature list', () => {
        // Create sign task to create a signer in servers.
        const taskFactory = new TaskFactory();

        const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

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

            return task.process({
                mode: 'single',
                custom_int: 0,
                custom_string: '0'
            });
        })
        .then(async () => {
            const signatureList = await ILovePDFCoreApi.getSignatureList(auth, xhr, 1, 1);
            expect( signatureList.length ).toBeGreaterThan(0);
        });
    });

    it('voids a signature', async () => {
        // Create sign task to create a signer in servers.
        const taskFactory = new TaskFactory();

        const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        await task.start()
        await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

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

        const serverSignTask = await ILovePDFCoreApi.getSignature( auth, xhr, task.token );
        const { status } = await serverSignTask.getStatus();

        expect(status).toBe('void');
    });

    it('increases a signature expiration days', async () => {
        // Create sign task to create a signer in servers.
        const taskFactory = new TaskFactory();

        const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

        const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

        await task.start()
        await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

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

        await task.process({
            mode: 'multiple',
            custom_int: 0,
            custom_string: '0'
        });

        // Increase expiration days.
        const INCREASED_DAYS = 3;
        await ILovePDFCoreApi.increaseSignatureExpirationDays(auth, xhr, task.token, INCREASED_DAYS);

        const serverSignTask = await ILovePDFCoreApi.getSignature( auth, xhr, task.token );
        const { created, expires } = await serverSignTask.getStatus();

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
        await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

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

});

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function dateDiffInDays(a: Date, b: Date): number {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / MS_PER_DAY);
}