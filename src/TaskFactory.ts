import ILovePDFTool from "./types/ILovePDFTool";
import Task, { TaskParams } from "./Task";
import MergeTask from "./MergeTask";
import TaskTypeNotExistsError from "./errors/TaskTypeNotExistsError";
import SplitTask from "./SplitTask";

export interface TaskFactoryI {
    newTask: (taskType: ILovePDFTool) => Task;
}

export default class TaskFactory implements TaskFactoryI {

    newTask(taskType: ILovePDFTool, params?: TaskParams): Task {
        if (taskType === 'merge') {
            return new MergeTask('', '', params);
        }
        else if (taskType === 'split') {
            return new SplitTask('', '', params);
        }

        // Don't return and throw an error.
        throw new TaskTypeNotExistsError();
    }

}