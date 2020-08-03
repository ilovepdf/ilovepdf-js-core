import Task, { ProcessParams } from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";

interface CompressProcessParams extends ProcessParams {
    compression_level?: 'low' | 'recommended' | 'extreme';
}

export default class CompressTask extends Task {
    public type: ILovePDFTool;

    constructor(auth: Auth, params: TaskParams = {}) {
        super(auth, params);

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