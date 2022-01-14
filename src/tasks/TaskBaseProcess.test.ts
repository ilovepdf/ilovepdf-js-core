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

    it('processes', async () => {
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

    it('gets a task status', () => {
        const task = taskFactory.newTask('compress', auth, xhr);

        return task.start()
        .then(task => {
            return task.addFile('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        })
        .then(task => {
            return task.process();
        })
        .then(task =>{
            return task.getStatus();
        })
        .then(status => {
            expect(status).toBe('TaskSuccess');
        });
    });

});
