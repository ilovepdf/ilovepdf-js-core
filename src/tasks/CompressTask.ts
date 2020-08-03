import Task, { ProcessParams } from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";
import XHRInterface from "../utils/XHRInterface";

interface CompressProcessParams extends ProcessParams {
    compression_level?: 'low' | 'recommended' | 'extreme';
}

export default class CompressTask extends Task {
    public type: ILovePDFTool;

    constructor(auth: Auth, xhr: XHRInterface , params: TaskParams = {}) {
        super(auth, xhr, params);

        this.type = 'compress';
    }

    /**
     * @inheritdoc
     * @override
     * @param params - ProcessParams object with extra attrs for this service.
     */
    process(params?: CompressProcessParams) {
        return super.process(params);
    }

}