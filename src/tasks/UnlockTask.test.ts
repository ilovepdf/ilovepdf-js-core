import TaskFactory from "./TaskFactory";
import XHRPromise from "../utils/XHRPromise";
import JWT from "../auth/JWT";
import dotenv from 'dotenv';
import ILovePDFFile from "../utils/ILovePDFFile";
import path from 'path';
import { inRange } from "../utils/math";
import UnlockTask from "./UnlockTask";

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('UnlockTask', () => {

    it('process', () => {
        const task = taskFactory.newTask('unlock', auth, xhr) as UnlockTask;

        return task.start()
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample_protected.pdf'), { password: 'test' });
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
            expect( inRange(data.length, 2784, 350) ).toBeTruthy();
        });
    });

    it('process with wrong password', () => {
        const task = taskFactory.newTask('unlock', auth, xhr) as UnlockTask;

        expect(() => {
            return task.start()
            .then(() => {
                const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample_protected.pdf'), { password: 'wrong password' });
                return task.addFile(file);
            })
            .then(() => {
                return task.process();
            });
        })
        .rejects.toThrow();
    });

});
