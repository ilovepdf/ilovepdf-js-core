import TaskFactory from "./TaskFactory";
import XHRPromise from "../utils/XHRPromise";
import JWT from "../auth/JWT";
import dotenv from 'dotenv';
import ILovePDFFile from "../utils/ILovePDFFile";
import path from 'path';
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

            const expectedFileText = 'Dummy PDF file OCR test, page 1 Dummy PDF file OCR test, page 2';
            expect(text).toEqual(expectedFileText)
        } catch (error) {
            // log axios errors
            if (error?.response?.data?.error) {
                console.log(error.response.data.error)
            }
            throw error;
        }
    })
})