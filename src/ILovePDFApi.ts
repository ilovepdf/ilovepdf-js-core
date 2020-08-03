import Task, { TaskParams } from "./tasks/Task";
import TaskFactory, { TaskFactoryI } from "./tasks/TaskFactory";
import Auth from "./auth/Auth";
import JWT from "./auth/JWT";
import ILovePDFTool from "./types/ILovePDFTool";

export interface ILovePDFApiI {
    newTask: (taskType: ILovePDFTool, params?: TaskParams) => Task;
}

export default class ILovePDFApi implements ILovePDFApiI {
    private auth: Auth;
    private taskFactory: TaskFactoryI;

    constructor(publicKey: string) {
        this.auth = new JWT(publicKey);
        this.taskFactory = new TaskFactory();
    }

    public newTask(taskType: ILovePDFTool, params: TaskParams = {}) {
        return this.taskFactory.newTask(taskType, this.auth, params);
    }

    // getTask(taskId: string): Task {

    // }

    // listTasks(): Array<Task> {

    // }

}
