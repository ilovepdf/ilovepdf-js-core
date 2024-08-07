import {describe, it, expect} from "@jest/globals";
import TaskFactory from "./TaskFactory";
import XHRPromise from "../utils/XHRPromise";
import JWT from "../auth/JWT";
import dotenv from 'dotenv';
import ILovePDFFile from "../utils/ILovePDFFile";
import path from 'path';
import '../tests/expectToBeWithinRange'
import PdfOcrTask from "./PdfOcrTask";

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);


/**
 * Replaces all whitespace with a single space and trims the text.
 */
const byteArrayToSanitizedText = (text: Uint8Array): string => {
    const textContents = Buffer.from(text).toString('utf16le');
    console.log(textContents);
    const trimmedText = textContents.replace(/\s+/g, " ").trim()
    return trimmedText
}

describe('PdfOcrTask', () => {
    it('processes', async () => {
        try {
            // Turn the PDF from image to PDf with text
            const task = taskFactory.newTask('pdfocr', auth, xhr) as PdfOcrTask;
            await task.start()
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/ocr_test.pdf'));
            await task.addFile(file);
            await task.process();
            const data = await task.download();
            console.log(`Length: ${ data.length }`);
            expect(data.length).toBeWithinRange(171774, 200);
        } catch (error) {
            // log axios errors
            if (error?.response?.data) {
                const data = JSON.parse(error.response.data.toString());
                console.log(data.error)
            }
            throw error;
        }
    })

    it('recognizes the text', async () => {
        try {
            // Turn the PDF from image to PDf with text
            const pdfOcrTask = taskFactory.newTask('pdfocr', auth, xhr) as PdfOcrTask;
            await pdfOcrTask.start()
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/ocr_test.pdf'));
            await pdfOcrTask.addFile(file);
            await pdfOcrTask.process();

            // Extract the text
            const extractTextTask = await pdfOcrTask.connect('extract')
            await extractTextTask.process();
            const data = await extractTextTask.download();
            const text = byteArrayToSanitizedText(data)

            const expectedFileText: string = 'Dummy PDF file OCR test, page 1 Dummy PDF file OCR test, page 2';
            expect(text).toEqual(expectedFileText)
        } catch (error) {
            // log axios errors
            if (error?.response?.data) {
                const data = JSON.parse(error.response.data.toString());
                console.log(data.error)
            }
            throw error;
        }
    })

    it('supports language parameter', async () => {
        try {
            // Turn the PDF from image to PDf with text
            const pdfOcrTask = taskFactory.newTask('pdfocr', auth, xhr) as PdfOcrTask;
            await pdfOcrTask.start()
            const file = new ILovePDFFile(path.resolve(__dirname, '../tests/input/ocr_test_cat.pdf'));
            await pdfOcrTask.addFile(file);
            await pdfOcrTask.process({ocr_languages: ['cat']});

            // Extract the text
            const extractTextTask = await pdfOcrTask.connect('extract')
            await extractTextTask.process();
            const data = await extractTextTask.download();
            const text = byteArrayToSanitizedText(data)

            const expectedFileText: string = 'Això és una prova de PDF OCR.';
            expect(text).toEqual(expectedFileText)
        } catch (error) {
            // log axios errors
            if (error?.response?.data) {
                const data = JSON.parse(error.response.data.toString());
                console.log(data.error)
            }
            throw error;
        }
    })
})