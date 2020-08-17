import dotenv from 'dotenv';
import path from 'path';
import TaskFactory from './TaskFactory';
import JWT from '../auth/JWT';
import XHRPromise from '../utils/XHRPromise';
import ILovePDFFile from '../utils/ILovePDFFile';
import { inRange } from '../utils/math';

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('Task', () => {

    it('starts a task', async () => {
        const task = taskFactory.newTask('merge', auth, xhr);

        return task.start()
        .then((sameTask) => {

            expect(sameTask === task).toBeTruthy();
        });
    });

    it('adds a file from URL', async () => {
        const task = taskFactory.newTask('merge', auth, xhr);

        return task.start()
        .then(() => {
            return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        });
    });

    it('adds a file from ILovePDFFile', async () => {
        const task = taskFactory.newTask('merge', auth, xhr);

        return task.start()
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));
            return task.addFile(file);
        });
    });

    it('process a merge', async () => {
        const task = taskFactory.newTask('merge', auth, xhr);

        return task.start()
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));
            return task.addFile(file);
        })
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));
            return task.addFile(file);
        })
        .then(() => {
            return task.process();
        });
    });

    it('downloads a pdf', async () => {
        const task = taskFactory.newTask('merge', auth, xhr);

        return task.start()
        .then(() => {
            return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        })
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));
            return task.addFile(file);
        })
        .then(() => {
            return task.process();
        })
        .then(() => {
            return task.download();
        })
        .then(data => {
            expect( inRange(data.length, 15383, 5) ).toBeTruthy();
        });
    });

    it('connects a task', async () => {
        const task = taskFactory.newTask('split', auth, xhr);
        const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));

        return task.start()
        .then(task => {
            return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        })
        .then(task => {
            return task.addFile(file);
        })
        .then(task => {
            return task.process();
        })
        .then(task =>{
            return task.connect('merge');
        })
        .then((connectedTask) => {
            return connectedTask.addFile(file);
        })
        .then((connectedTask) => {
            return connectedTask.process()
        })
        .then((connectedTask) => {
            return connectedTask.download();
        })
        .then(data => {
            expect( inRange(data.length, 17807, 5) ).toBeTruthy();
        });
    });

    it('deletes a task', async () => {
        const task = taskFactory.newTask('split', auth, xhr);
        const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));

        return task.start()
        .then(task => {
            return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        })
        .then(task => {
            return task.addFile(file);
        })
        .then(task => {
            return task.process();
        })
        .then(task =>{
            return task.delete();
        });
    });

    it('deletes a file', async () => {
        const task = taskFactory.newTask('merge', auth, xhr);
        const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));

        expect(() => {
            return task.start()
            .then(task => {
                return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
            })
            .then(task => {
                return task.addFile(file);
            })
            .then(task => {
                return task.deleteFile(file);
            })
            .then(() => {
                return task.process();
            });
        })
        .rejects.toThrow();
    })

});
