import dotenv from 'dotenv';
import ILovePDFCoreApi, { UpdateSignerData } from './ILovePDFCoreApi';
import XHRPromise from './utils/XHRPromise';
import JWT from './auth/JWT';
import TaskFactory from './tasks/TaskFactory';
import SignTask from './tasks/sign/SignTask';
import SignatureFile from './tasks/sign/SignatureFile';
import Signer from './tasks/sign/Signer';
import CompressTask from './tasks/CompressTask';
import ILovePDFFile from './utils/ILovePDFFile';
import { inRange } from './utils/math';
import path from 'path';

// Load env vars.
dotenv.config();

const xhr = new XHRPromise();

describe('ILovePDFCoreApi', () => {

    it('updates a Signer', () => {
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
            // Update signer.
            const { token_signer } = task.signers[0];

            const data: UpdateSignerData = {
                status: 'sent'
            };

            const response = await ILovePDFCoreApi.updateSigner(auth, xhr, token_signer, data)
            expect(response.status).toBe(data.status);
        })
        .catch(err => {
            expect(err.response.data.error.param.status).toBe('Can\'t be set to sent');
        });
    });

    it('tries to update a Signer email but throws error due to email status', () => {
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
            // Update signer.
            const { token_requester } = task.signers[0];

            const email = 'example'

            return ILovePDFCoreApi.updateSignerEmail(auth, xhr, token_requester, email);
        })
        .catch(err => {
            expect(err.response.data.error.param.status).toBe('No error email status for this signer, can\'t be modified.');
        });
    });

    it('updates a Signer phone', () => {
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
        })
        .then(async () => {
            // Update signer.
            const { token_requester } = task.signers[0];

            const phone = '654654654';

            const response = await ILovePDFCoreApi.updateSignerPhone(auth, xhr, token_requester, phone);
            expect(response.phone).toBe(phone);
        });
    });

    it('gets a template', () => {
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

            return task.saveAsTemplate({
                template_name: 'Plantillita',
                mode: 'single',
                custom_int: 0,
                custom_string: '0'
            });
        })
        .then(async () => {
            const { task: taskId } = task.responses.start;
            const response = await ILovePDFCoreApi.getSignatureTemplate(auth, xhr, taskId);
            expect(response.name).toBe('Plantillita');
        });
    });

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

});