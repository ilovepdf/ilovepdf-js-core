import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from "./Task";
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

export default class TaskFactory implements TaskFactoryI {

    /**
     * Factory method to create a task with the correct params.
     * @param taskType - Task type that will use a specific ILovePDF tool.
     * @param params - Parameters to customize the process.
     */
    newTask(taskType: ILovePDFTool, auth: Auth, xhr: XHRInterface, params: TaskParams = {}): TaskI {
        if (taskType === 'merge') {
            return new MergeTask(auth, xhr, params);
        }
        else if (taskType === 'split') {
            return new SplitTask(auth, xhr, params);
        }
        else if (taskType === 'compress') {
            return new CompressTask(auth, xhr, params);
        }
        else if (taskType === 'extract') {
            return new ExtractTask(auth, xhr, params);
        }
        else if (taskType === 'htmlpdf') {
            return new HtmlPdfTask(auth, xhr, params);
        }
        else if (taskType === 'imagepdf') {
            return new ImagePdfTask(auth, xhr, params);
        }
        else if (taskType === 'officepdf') {
            return new OfficePdfTask(auth, xhr, params);
        }
        else if (taskType === 'pagenumber') {
            return new PageNumberTask(auth, xhr, params);
        }
        else if (taskType === 'pdfa') {
            return new PdfaTask(auth, xhr, params);
        }
        else if (taskType === 'pdfjpg') {
            return new PdfJpgTask(auth, xhr, params);
        }
        else if (taskType === 'protect') {
            return new ProtectTask(auth , xhr, params);
        }
        else if (taskType === 'repair') {
            return new RepairTask(auth, xhr, params);
        }
        else if (taskType === 'rotate') {
            return new RotateTask(auth, xhr, params);
        }
        else if (taskType === 'unlock') {
            return new UnlockTask(auth, xhr, params);
        }
        else if (taskType === 'validatepdfa') {
            return new ValidatePdfaTask(auth, xhr, params);
        }
        else if (taskType === 'watermark') {
            return new WatermarkTask(auth, xhr, params);
        }
        else if (taskType === 'sign') {
            return new SignTask(auth, xhr, params);
        }
        else if (taskType === 'editpdf') {
            return new EditTask(auth, xhr, params);
        }

        // Don't return and throw an error.
        throw new TaskTypeNotExistsError();
    }

}