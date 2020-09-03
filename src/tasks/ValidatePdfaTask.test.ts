import TaskFactory from "./TaskFactory";
import XHRPromise from "../utils/XHRPromise";
import JWT from "../auth/JWT";
import dotenv from 'dotenv';
import ILovePDFFile from "../utils/ILovePDFFile";
import path from 'path';
import ValidatePdfaTask from "./ValidatePdfaTask";

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('ValidatePdfaTask', () => {

    it('process', () => {
        const task = taskFactory.newTask('validatepdfa', auth, xhr) as ValidatePdfaTask;

        return task.start()
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));
            return task.addFile(file);
        })
        .then(() => {
            return task.process();
        })
        .then(() => {
            return task.responses.process?.validations![0].status;
        })
        .then(status => {
            expect(status).toBe('NonConformant');
        });
    });

    it('process with conformance setting', () => {
        const task = taskFactory.newTask('validatepdfa', auth, xhr) as ValidatePdfaTask;

        return task.start()
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample_2b.pdf'));
            return task.addFile(file);
        })
        .then(() => {
            return task.process({ conformance: 'pdfa-2b' });
        })
        .then(() => {
            return task.responses.process?.validations![0].status;
        })
        .then(status => {
            expect(status).toBe('Conformant');
        });
    });

});
