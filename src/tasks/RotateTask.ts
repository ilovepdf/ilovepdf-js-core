import Task from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";

export default class RotateTask extends Task {
    public type: ILovePDFTool;

    constructor(auth: Auth, params: TaskParams = {}) {
        super(auth, params);

        this.type = 'rotate';
    }

}