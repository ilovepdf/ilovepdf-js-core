import Task from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";
import XHRInterface from "../utils/XHRInterface";
import TaskBaseProcess, { ProcessParams } from "./TaskBaseProcess";

export interface ProtectProcessParams extends ProcessParams {
    // Password to encrypt the PDF file.
    password?: string;
}

export default class ProtectTask extends TaskBaseProcess {
    public type: ILovePDFTool;

    constructor(auth: Auth, xhr: XHRInterface, params: TaskParams) {
        super(auth, xhr, params);

        this.type = 'protect';
    }

    /**
     * @inheritdoc
     * @override
     * @param params - ProcessParams object with extra attrs for this service.
     */
    process(params: ProtectProcessParams = { password: '' }) {
        return super.process(params);
    }

}