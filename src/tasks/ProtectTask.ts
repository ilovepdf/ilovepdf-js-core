import Task from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";
import XHRInterface from "../utils/XHRInterface";
import { ProcessParams } from "./TaskI";

export interface ProtectProcessParams extends ProcessParams {
    // Password to encrypt the PDF file.
    password: string;
}

export default class ProtectTask extends Task {
    public type: ILovePDFTool;

    private password: string;

    constructor(auth: Auth, xhr: XHRInterface, password: string, params: TaskParams) {
        super(auth, xhr, params);

        this.password = password
        this.type = 'protect';
    }

    /**
     * @inheritdoc
     * @override
     * @param params - ProcessParams object with extra attrs for this service.
     */
    process(params: ProcessParams = {}) {
        // Inject password.
        (params as ProtectProcessParams).password = this.password;
        return super.process(params);
    }

}