import {describe, it, expect} from "@jest/globals";
import TaskFactory from "./TaskFactory";
import XHRPromise from "../utils/XHRPromise";
import JWT from "../auth/JWT";
import dotenv from 'dotenv';
import CompressTask from "./CompressTask";
import ILovePDFFile from "../utils/ILovePDFFile";
import path from 'path';
import '../tests/expectToBeWithinRange'

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('CompressTask', () => {

    it('process with low compress', () => {
        const task = taskFactory.newTask('compress', auth, xhr) as CompressTask;

        return task.start()
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));
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
            expect( data.length).toBeWithinRange( 1697, 200);
        });
    });

    it('process with extreme compress', () => {
        const task = taskFactory.newTask('compress', auth, xhr) as CompressTask;

        return task.start()
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));
            return task.addFile(file);
        })
        .then(() => {
            return task.process({ compression_level: 'extreme' });
        })
        .then(() => {
            return task.download();
        })
        .then(data => {
            console.log(`Length: ${ data.length }`);
            expect( data.length).toBeWithinRange( 1762, 200);
        });
    });

});
