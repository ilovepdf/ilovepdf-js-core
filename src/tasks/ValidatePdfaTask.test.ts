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

    it('process', async () => {
        const task = taskFactory.newTask('validatepdfa', auth, xhr) as ValidatePdfaTask;

        await task.start()

        const osfile = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.pdf'));
        await task.addFile(osfile);

        const { validations } = await task.process();

        expect(validations![0].status).toBe('NonConformant');
    });

    it('process with conformance setting', async () => {
        const task = taskFactory.newTask('validatepdfa', auth, xhr) as ValidatePdfaTask;

        await task.start()

        const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample_2b.pdf'));
        await task.addFile(file);

        await task.process({ conformance: 'pdfa-2b' });

        const { validations } = await task.process();

        expect(validations![0].status).toBe('Conformant');
    });

});
