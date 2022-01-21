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
        await task.start();
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
            console.log(`Length: ${ data.length }`);
            expect( inRange(data.length, 15383, 200) ).toBeTruthy();
        });
    });

    it('connects a task', async () => {
        const task = taskFactory.newTask('split', auth, xhr);

        // Start task.
        await task.start()

        // Add file from cloud.
        await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        // Add local file.
        const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));
        await task.addFile(file);

        // Process the split.
        await task.process();

        // Connect the split output to a merge.
        const connectedTask = await task.connect('merge');

        await connectedTask.addFile(file);

        await connectedTask.process()

        const data = await connectedTask.download();

        console.log(`Length: ${ data.length }`);
        expect( inRange(data.length, 17807, 200) ).toBeTruthy();
    });

    it('deletes a task', async () => {
        const task = taskFactory.newTask('split', auth, xhr);

        await task.start()

        await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

        const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));
        await task.addFile(file);

        await task.process();

        await task.delete();
    });

    it('deletes a file', async () => {

        expect(async () => {
            const task = taskFactory.newTask('merge', auth, xhr);
            await task.start()

            await task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));
            await task.addFile(file);

            await task.deleteFile(file);

            await task.process();
        })
        .rejects.toThrow();
    })

});
