import Task, { ProcessParams } from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';

export interface ProtectProcessParams extends ProcessParams {
    password: string;
}

export default class ProtectTask extends Task {
    public type: ILovePDFTool;

    constructor(publicKey: string, secretKey: string, params: TaskParams) {
        super(publicKey, secretKey, params);

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