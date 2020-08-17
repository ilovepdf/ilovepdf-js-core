import TaskFactory from "./TaskFactory";
import XHRPromise from "../utils/XHRPromise";
import JWT from "../auth/JWT";
import dotenv from 'dotenv';
import ILovePDFFile from "../utils/ILovePDFFile";
import path from 'path';
import { inRange } from "../utils/math";
import RotateTask from "./RotateTask";

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('RotateTask', () => {

    it('process', () => {
        const task = taskFactory.newTask('rotate', auth, xhr) as RotateTask;

        return task.start()
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'), { rotate: 90 });
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
            expect( inRange(data.length, 2816, 150) ).toBeTruthy();
        });
    });

});
