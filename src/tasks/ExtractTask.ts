import Task from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";
import XHRInterface from "../utils/XHRInterface";
import TaskBaseProcess, { ProcessParams } from "./TaskBaseProcess";

interface ExtractProcessParams extends ProcessParams {
    detailed?: boolean;
    by_word?: boolean;
}

export default class ExtractTask extends TaskBaseProcess {
    public type: ILovePDFTool;

    constructor(auth: Auth, xhr: XHRInterface , params: TaskParams = {}) {
        super(auth, xhr, params);

        this.type = 'extract';
    }

    /**
     * @inheritdoc
     * @override
     * @param params - ProcessParams object with extra attrs for this service.
     */
    process(params?: ExtractProcessParams) {
        return super.process(params);
    }

}