import {describe, it, expect} from "@jest/globals";
import TaskFactory from "./TaskFactory";
import XHRPromise from "../utils/XHRPromise";
import JWT from "../auth/JWT";
import dotenv from 'dotenv';
import ILovePDFFile from "../utils/ILovePDFFile";
import path from 'path';
import '../tests/expectToBeWithinRange'
import ProtectTask from "./ProtectTask";

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('ProtectTask', () => {

    it('process', () => {
        const task = taskFactory.newTask('protect', auth, xhr) as ProtectTask;

        return task.start()
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));
            return task.addFile(file);
        })
        .then(() => {
            return task.process({ password: 'test' });
        })
        .then(() => {
            return task.download();
        })
        .then(data => {
            console.log(`Length: ${ data.length }`);
            expect(data.length).toBeWithinRange(3310, 150);
        });
    });

    it('process without a password', () => {
        const task = taskFactory.newTask('protect', auth, xhr) as ProtectTask;

        expect(() => {
            return task.start()
            .then(() => {
                const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));
                return task.addFile(file);
            })
            .then(() => {
                return task.process();
            });
        })
        .rejects.toThrow();
    });

});
