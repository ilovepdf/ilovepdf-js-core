import TaskFactory from "../TaskFactory";
import XHRPromise from "../../utils/XHRPromise";
import JWT from "../../auth/JWT";
import dotenv from 'dotenv';
import EditTask from "./EditTask";
import ILovePDFFile from "../../utils/ILovePDFFile";
import path from 'path';
import Text from "./Text";
import Image from "./Image";

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('EditTask', () => {

    it('adds a text element', () => {
        const task = taskFactory.newTask('editpdf', auth, xhr) as EditTask;

        return task.start()
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../../tests/input/sample.pdf'));
            return task.addFile(file);
        })
        .then(() => {
            const textElement = new Text({
                coordinates: { x: 100, y: 100 },
                dimensions: { w: 100, h: 100 },
                text: 'test',
            });
            return task.addElement(textElement);
        })
        .then(() => {
            return task.process();
        })
        .then(() => {
            return task.download();
        })
        .then(data => {
            console.log(`Length: ${ data.length }`);
            const expected = 13761
            const errorMargin = 200
            expect(data.length).toBeGreaterThan(expected - errorMargin)
            expect(data.length).toBeLessThan(expected + errorMargin)
        });
    });

    it('adds an image element', () => {
        const task = taskFactory.newTask('editpdf', auth, xhr) as EditTask;

        return task.start()
        .then(() => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../../tests/input/sample.pdf'));
            return task.addFile(file);
        })
        .then(async () => {
            const file = new ILovePDFFile(path.resolve(__dirname, '../../tests/input/ilovepdf.png'));
            await task.addFile(file);
            const imageElement = new Image({
                coordinates: { x: 100, y: 100 },
                dimensions: { w: 100, h: 100 },
                file,
            });
            return task.addElement(imageElement);
        })
        .then(() => {
            return task.process();
        })
        .then(() => {
            return task.download();
        })
        .then(data => {
            console.log(`Length: ${ data.length }`);
            const expected = 4236
            const errorMargin = 200
            expect(data.length).toBeGreaterThan(expected - errorMargin)
            expect(data.length).toBeLessThan(expected + errorMargin)
        });
    });

});
