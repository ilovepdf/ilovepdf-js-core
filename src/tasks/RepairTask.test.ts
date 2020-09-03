import TaskFactory from "./TaskFactory";
import XHRPromise from "../utils/XHRPromise";
import JWT from "../auth/JWT";
import dotenv from 'dotenv';
import ILovePDFFile from "../utils/ILovePDFFile";
import path from 'path';
import { inRange } from "../utils/math";
import RepairTask from "./RepairTask";

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('RepairTask', () => {

    it('process', () => {
        const task = taskFactory.newTask('repair', auth, xhr) as RepairTask;

        return task.start()
        .then(() => {
            // Only works with standard pdfs.
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample_2b.pdf'));
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
            expect( inRange(data.length, 14364, 150) ).toBeTruthy();
        });
    });

});
