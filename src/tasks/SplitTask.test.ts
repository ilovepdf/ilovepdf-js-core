import TaskFactory from "./TaskFactory";
import XHRPromise from "../utils/XHRPromise";
import JWT from "../auth/JWT";
import dotenv from 'dotenv';
import ILovePDFFile from "../utils/ILovePDFFile";
import path from 'path';
import { inRange } from "../utils/math";
import SplitTask from "./SplitTask";

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('SplitTask', () => {

    it('process', () => {
        const task = taskFactory.newTask('split', auth, xhr) as SplitTask;

        return task.start()
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));
            return task.addFile(file);
        })
        .then(() => {
            return task.process({ split_mode: 'ranges', remove_pages: '1', merge_after: true });
        })
        .then(() => {
            return task.download();
        })
        .then(data => {
            expect( inRange(data.length, 2070, 5) ).toBeTruthy();
        });
    });

});
