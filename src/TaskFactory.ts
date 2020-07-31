import ILovePDFTool from "./types/ILovePDFTool";
import Task, { TaskParams } from "./Task";
import MergeTask from "./MergeTask";
import TaskTypeNotExistsError from "./errors/TaskTypeNotExistsError";
import SplitTask from "./SplitTask";
import CompressTask from "./CompressTask";
import WatermarkTask from "./WatermarkTask";
import ValidatePdfaTask from "./ValidatePdfaTask";
import ProtectTask, { ProtectProcessParams } from "./ProtectTask";
import PdfJpgTask from "./PdfJpgTask";
import PdfaTask from "./PdfaTask";
import PageNumberTask from "./PageNumberTask";
import ImagePdfTask from "./ImagePdfTask";
import RequiredParamError from "./errors/RequiredParamError";
import UnlockTask from "./UnlockTask";
import RotateTask from "./RotateTask";
import RepairTask from "./RepairTask";
import OfficePdfTask from "./OfficePdfTask";
import HtmlPdfTask from "./HtmlPdfTask";
import ExtractTask from "./ExtractTask";

export interface TaskFactoryI {
    newTask: (taskType: ILovePDFTool) => Task;
}

export default class TaskFactory implements TaskFactoryI {

    /**
     * Factory method to create a task with the correct params.
     * @param taskType - Task type that will use a specific ILovePDF tool.
     * @param params - Parameters to customize the process.
     */
    newTask(taskType: ILovePDFTool, params: TaskParams = {}): Task {
        if (taskType === 'merge') {
            return new MergeTask('', '', params);
        }
        else if (taskType === 'split') {
            return new SplitTask('', '', params);
        }
        else if (taskType === 'compress') {
            return new CompressTask('', '', params);
        }
        else if (taskType === 'extract') {
            return new ExtractTask('', '', params);
        }
        else if (taskType === 'htmlpdf') {
            return new HtmlPdfTask('', '', params);
        }
        else if (taskType === 'imagepdf') {
            return new ImagePdfTask('', '', params);
        }
        else if (taskType === 'officepdf') {
            return new OfficePdfTask('', '', params);
        }
        else if (taskType === 'pagenumber') {
            return new PageNumberTask('', '', params);
        }
        else if (taskType === 'pdfa') {
            return new PdfaTask('', '', params);
        }
        else if (taskType === 'pdfjpg') {
            return new PdfJpgTask('', '', params);
        }
        else if (taskType === 'protect') {
            // For protect, para property 'password' is required.
            const { password } = params as ProtectProcessParams;
            if (!password) throw new RequiredParamError('\'password\' property is required');

            return new ProtectTask('', '' , params);
        }
        else if (taskType === 'repair') {
            return new RepairTask('', '', params);
        }
        else if (taskType === 'rotate') {
            return new RotateTask('', '', params);
        }
        else if (taskType === 'unlock') {
            return new UnlockTask('', '', params);
        }
        else if (taskType === 'validatepdfa') {
            return new ValidatePdfaTask('', '', params);
        }
        else if (taskType === 'watermark') {
            return new WatermarkTask('', '', params);
        }

        // Don't return and throw an error.
        throw new TaskTypeNotExistsError();
    }

}