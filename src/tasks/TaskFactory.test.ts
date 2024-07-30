import dotenv from 'dotenv';
import TaskFactory from './TaskFactory';
import XHRPromise from '../utils/XHRPromise';
import JWT from '../auth/JWT';
import MergeTask from './MergeTask';
import CompressTask from './CompressTask';
import SignTask from './sign/SignTask';
import WatermarkTask from './WatermarkTask';
import ValidatePdfaTask from './ValidatePdfaTask';
import UnlockTask from './UnlockTask';
import SplitTask from './SplitTask';
import RotateTask from './RotateTask';
import RepairTask from './RepairTask';
import ProtectTask from './ProtectTask';
import PdfJpgTask from './PdfJpgTask';
import PdfaTask from './PdfaTask';
import PageNumberTask from './PageNumberTask';
import OfficePdfTask from './OfficePdfTask';
import ImagePdfTask from './ImagePdfTask';
import HtmlPdfTask from './HtmlPdfTask';
import ExtractTask from './ExtractTask';
import TaskTypeNotExistsError from '../errors/TaskTypeNotExistsError';
import ILovePDFTool from '../types/ILovePDFTool';
import EditTask from './edit/EditTask';
import PdfOcrTask from "./PdfOcrTask";

// Load env vars.
dotenv.config();

const taskFactory = new TaskFactory();
const xhr = new XHRPromise();
const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('TaskFactory', () => {

    it('creates a compress task', () => {
        const task = taskFactory.newTask('compress', auth, xhr);
        expect(task).toBeInstanceOf(CompressTask);
    })

    it('creates a extract task', () => {
        const task = taskFactory.newTask('extract', auth, xhr);
        expect(task).toBeInstanceOf(ExtractTask);
    })

    it('creates a htmlpdf task', () => {
        const task = taskFactory.newTask('htmlpdf', auth, xhr);
        expect(task).toBeInstanceOf(HtmlPdfTask);
    })

    it('creates a imagepdf task', () => {
        const task = taskFactory.newTask('imagepdf', auth, xhr);
        expect(task).toBeInstanceOf(ImagePdfTask);
    })

    it('creates a merge task', () => {
        const task = taskFactory.newTask('merge', auth, xhr);
        expect(task).toBeInstanceOf(MergeTask);
    })

    it('creates a officepdf task', () => {
        const task = taskFactory.newTask('officepdf', auth, xhr);
        expect(task).toBeInstanceOf(OfficePdfTask);
    })

    it('creates a pagenumber task', () => {
        const task = taskFactory.newTask('pagenumber', auth, xhr);
        expect(task).toBeInstanceOf(PageNumberTask);
    })

    it('creates a pdfa task', () => {
        const task = taskFactory.newTask('pdfa', auth, xhr);
        expect(task).toBeInstanceOf(PdfaTask);
    })

    it('creates a pdfjpg task', () => {
        const task = taskFactory.newTask('pdfjpg', auth, xhr);
        expect(task).toBeInstanceOf(PdfJpgTask);
    })

    it('creates a protect task', () => {
        const task = taskFactory.newTask('protect', auth, xhr);
        expect(task).toBeInstanceOf(ProtectTask);
    })

    it('creates a repair task', () => {
        const task = taskFactory.newTask('repair', auth, xhr);
        expect(task).toBeInstanceOf(RepairTask);
    })

    it('creates a rotate task', () => {
        const task = taskFactory.newTask('rotate', auth, xhr);
        expect(task).toBeInstanceOf(RotateTask);
    })

    it('creates a split task', () => {
        const task = taskFactory.newTask('split', auth, xhr);
        expect(task).toBeInstanceOf(SplitTask);
    })

    it('creates a unlock task', () => {
        const task = taskFactory.newTask('unlock', auth, xhr);
        expect(task).toBeInstanceOf(UnlockTask);
    })

    it('creates a validatepdfa task', () => {
        const task = taskFactory.newTask('validatepdfa', auth, xhr);
        expect(task).toBeInstanceOf(ValidatePdfaTask);
    })

    it('creates a watermark task', () => {
        const task = taskFactory.newTask('watermark', auth, xhr);
        expect(task).toBeInstanceOf(WatermarkTask);
    })

    it('creates a sign task', () => {
        const task = taskFactory.newTask('sign', auth, xhr);
        expect(task).toBeInstanceOf(SignTask);
    })

    it('creates an edit task', () => {
        const task = taskFactory.newTask('editpdf', auth, xhr);
        expect(task).toBeInstanceOf(EditTask);
    })

    it('creates a pdfocr task', () => {
        const task = taskFactory.newTask('pdfocr', auth, xhr);
        expect(task).toBeInstanceOf(PdfOcrTask);
    })

    it('returns an error on invalid tool', () => {
        expect(() => {
            // Cast to ILovePDFTool to test it.
            const task = taskFactory.newTask(('other') as ILovePDFTool, auth, xhr);
        }).toThrow(TaskTypeNotExistsError);
    })

});