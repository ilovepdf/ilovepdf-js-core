import ILovePDFTool from "../types/ILovePDFTool";
import Task, { TaskParams } from "./Task";
import MergeTask from "./MergeTask";
import TaskTypeNotExistsError from "../errors/TaskTypeNotExistsError";
import SplitTask from "./SplitTask";
import CompressTask from "./CompressTask";
import WatermarkTask from "./WatermarkTask";
import ValidatePdfaTask from "./ValidatePdfaTask";
import ProtectTask from "./ProtectTask";
import PdfJpgTask from "./PdfJpgTask";
import PdfaTask from "./PdfaTask";
import PageNumberTask from "./PageNumberTask";
import ImagePdfTask from "./ImagePdfTask";
import UnlockTask from "./UnlockTask";
import RotateTask from "./RotateTask";
import RepairTask from "./RepairTask";
import OfficePdfTask from "./OfficePdfTask";
import HtmlPdfTask from "./HtmlPdfTask";
import ExtractTask from "./ExtractTask";
import Auth from "../auth/Auth";
import XHRInterface from "../utils/XHRInterface";
import TaskI from "./TaskI";
import SignTask from "./sign/SignTask";
import EditTask from "./edit/EditTask";

export interface TaskFactoryI {
    newTask: (taskType: ILovePDFTool, auth: Auth, xhr: XHRInterface, params?: TaskParams) => TaskI;
}

const tasks: {[key in ILovePDFTool]: typeof Task} = {
    merge: MergeTask,
    split: SplitTask,
    compress: CompressTask,
    extract: ExtractTask,
    htmlpdf: HtmlPdfTask,
    imagepdf: ImagePdfTask,
    officepdf: OfficePdfTask,
    pagenumber: PageNumberTask,
    pdfa: PdfaTask,
    pdfjpg: PdfJpgTask,
    protect: ProtectTask,
    repair: RepairTask,
    rotate: RotateTask,
    unlock: UnlockTask,
    validatepdfa: ValidatePdfaTask,
    watermark: WatermarkTask,
    sign: SignTask,
    editpdf: EditTask,
};

export default class TaskFactory implements TaskFactoryI {

    /**
     * Factory method to create a task with the correct params.
     * @param taskType - Task type that will use a specific ILovePDF tool.
     * @param params - Parameters to customize the process.
     */
    newTask(taskType: ILovePDFTool, auth: Auth, xhr: XHRInterface, params: TaskParams = {}): TaskI {
        const task: any = tasks[taskType];
        if (typeof task === 'undefined') {
            // Don't return and throw an error.
            throw new TaskTypeNotExistsError();
        }
        return new task(auth, xhr, params);
    }

}