import dotenv from 'dotenv';
import path from 'path';
import TaskFactory from './TaskFactory';
import JWT from '../auth/JWT';
import XHRPromise from '../utils/XHRPromise';
import ILovePDFFile from '../utils/ILovePDFFile';
import { inRange } from '../utils/math';
import TaskBaseProcess from './TaskBaseProcess';

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('Task', () => {

    it('processes', async () => {
        const task = taskFactory.newTask('merge', auth, xhr);

        await task.start()

        const file1 = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));
        await task.addFile(file1);

        const file2 = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));
        await task.addFile(file2);

        await task.process();
    });

});
