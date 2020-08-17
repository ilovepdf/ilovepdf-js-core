import TaskFactory from "./TaskFactory";
import XHRPromise from "../utils/XHRPromise";
import JWT from "../auth/JWT";
import dotenv from 'dotenv';
import ILovePDFFile from "../utils/ILovePDFFile";
import path from 'path';
import { inRange } from "../utils/math";
import HtmlPdfTask from "./HtmlPdfTask";

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('HtmlPdfTask', () => {

    it('process', () => {
        const task = taskFactory.newTask('htmlpdf', auth, xhr) as HtmlPdfTask;

        return task.start()
        .then(() => {
            return task.addFile('https://ilovepdf.com');
        })
        .then(() => {
            return task.process();
        })
        .then(() => {
            return task.download();
        })
        .then(data => {
            console.log(`Length: ${ data.length }`);
            expect( inRange(data.length, 288855, 5) ).toBeTruthy();
        });
    });

    it('process from file', () => {
        const task = taskFactory.newTask('htmlpdf', auth, xhr) as HtmlPdfTask;

        // Has to fail due to server does not accept files with html extension.
        expect(() => {
            return task.start()
            .then(() => {
                const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/sample.html'));
                return task.addFile(file);
            });
        })
        .rejects.toThrow();
    });

    it('process with page_size setting', () => {
        const task = taskFactory.newTask('htmlpdf', auth, xhr) as HtmlPdfTask;

        return task.start()
        .then(() => {
            return task.addFile('https://ilovepdf.com');
        })
        .then(() => {
            return task.process({ page_size: 'Letter' });
        })
        .then(() => {
            return task.download();
        })
        .then(data => {
            console.log(`Length: ${ data.length }`);
            expect( inRange(data.length, 289114, 5) ).toBeTruthy();
        });
    });

});
