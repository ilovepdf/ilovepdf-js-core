import Task, { ProcessParams } from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";
import XHRInterface from "../utils/XHRInterface";

export interface ProtectProcessParams extends ProcessParams {
    password: string;
}

export default class ProtectTask extends Task {
    public type: ILovePDFTool;

    constructor(auth: Auth, xhr: XHRInterface , params: TaskParams) {
        super(auth, xhr, params);

        this.type = 'protect';
    }

    /**
     * @inheritdoc
     * @override
     * @param params - ProcessParams object with extra attrs for this service.
     */
    process(params: ProtectProcessParams) {
        return super.process(params);
    }

}