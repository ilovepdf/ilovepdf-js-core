import ILovePDFTool from "../types/ILovePDFTool";
import Task, { TaskParams } from "./Task";
import MergeTask from "./MergeTask";
import TaskTypeNotExistsError from "../errors/TaskTypeNotExistsError";
import SplitTask from "./SplitTask";
import CompressTask from "./CompressTask";
import WatermarkTask from "./WatermarkTask";
import ValidatePdfaTask from "./ValidatePdfaTask";
import ProtectTask, { ProtectProcessParams } from "./ProtectTask";
import PdfJpgTask from "./PdfJpgTask";
import PdfaTask from "./PdfaTask";
import PageNumberTask from "./PageNumberTask";
import ImagePdfTask from "./ImagePdfTask";
import RequiredParamError from "../errors/RequiredParamError";
import UnlockTask from "./UnlockTask";
import RotateTask from "./RotateTask";
import RepairTask from "./RepairTask";
import OfficePdfTask from "./OfficePdfTask";
import HtmlPdfTask from "./HtmlPdfTask";
import ExtractTask from "./ExtractTask";
import Auth from "../auth/Auth";

export interface TaskFactoryI {
    newTask: (taskType: ILovePDFTool, auth: Auth, params?: TaskParams) => Task;
}

export default class TaskFactory implements TaskFactoryI {

    /**
     * Factory method to create a task with the correct params.
     * @param taskType - Task type that will use a specific ILovePDF tool.
     * @param params - Parameters to customize the process.
     */
    newTask(taskType: ILovePDFTool, auth: Auth, params: TaskParams = {}): Task {
        if (taskType === 'merge') {
            return new MergeTask(auth, params);
        }
        else if (taskType === 'split') {
            return new SplitTask(auth, params);
        }
        else if (taskType === 'compress') {
            return new CompressTask(auth, params);
        }
        else if (taskType === 'extract') {
            return new ExtractTask(auth, params);
        }
        else if (taskType === 'htmlpdf') {
            return new HtmlPdfTask(auth, params);
        }
        else if (taskType === 'imagepdf') {
            return new ImagePdfTask(auth, params);
        }
        else if (taskType === 'officepdf') {
            return new OfficePdfTask(auth, params);
        }
        else if (taskType === 'pagenumber') {
            return new PageNumberTask(auth, params);
        }
        else if (taskType === 'pdfa') {
            return new PdfaTask(auth, params);
        }
        else if (taskType === 'pdfjpg') {
            return new PdfJpgTask(auth, params);
        }
        else if (taskType === 'protect') {
            // For protect, para property 'password' is required.
            const { password } = params as ProtectProcessParams;
            if (!password) throw new RequiredParamError('\'password\' property is required');

            return new ProtectTask(auth , params);
        }
        else if (taskType === 'repair') {
            return new RepairTask(auth, params);
        }
        else if (taskType === 'rotate') {
            return new RotateTask(auth, params);
        }
        else if (taskType === 'unlock') {
            return new UnlockTask(auth, params);
        }
        else if (taskType === 'validatepdfa') {
            return new ValidatePdfaTask(auth, params);
        }
        else if (taskType === 'watermark') {
            return new WatermarkTask(auth, params);
        }

        // Don't return and throw an error.
        throw new TaskTypeNotExistsError();
    }

}