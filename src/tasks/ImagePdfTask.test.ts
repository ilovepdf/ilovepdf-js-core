import TaskFactory from "./TaskFactory";
import XHRPromise from "../utils/XHRPromise";
import JWT from "../auth/JWT";
import dotenv from 'dotenv';
import ILovePDFFile from "../utils/ILovePDFFile";
import path from 'path';
import { inRange } from "../utils/math";
import ImagePdfTask from "./ImagePdfTask";

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('ImagePdfTask', () => {

    it('process', () => {
        const task = taskFactory.newTask('imagepdf', auth, xhr) as ImagePdfTask;

        return task.start()
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.jpg'));
            return task.addFile(file);
        })
        .then(() => {
            return task.process();
        })
        .then(() => {
            return task.download();
        })
        .then(data => {
            expect( inRange(data.length, 3805, 5) ).toBeTruthy();
        });
    });

    it('process with pagesize setting', () => {
        const task = taskFactory.newTask('imagepdf', auth, xhr) as ImagePdfTask;

        return task.start()
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.jpg'));
            return task.addFile(file);
        })
        .then(() => {
            return task.process({ pagesize: 'letter' });
        })
        .then(() => {
            return task.download();
        })
        .then(data => {
            expect( inRange(data.length, 3700, 5) ).toBeTruthy();
        });
    });

});
