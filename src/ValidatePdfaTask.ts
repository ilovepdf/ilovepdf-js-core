import Task, { ProcessParams } from "./Task";
import ILovePDFTool from "./types/ILovePDFTool";
import { TaskParams } from './Task';

interface ValidatePdfaProcessParams extends ProcessParams {
    conformance?: 'pdfa-1b' | 'pdfa-1a' | 'pdfa-2b' | 'pdfa-2u' | 'pdfa-2a' | 'pdfa-3b' | 'pdfa-3u' | 'pdfa-3a';
}

export default class ValidatePdfaTask extends Task {
    public type: ILovePDFTool;

    constructor(publicKey: string, secretKey: string, params: TaskParams = {}) {
        super(publicKey, secretKey, params);

        this.type = 'validatepdfa';
    }

    /**
     * @inheritdoc
     * @override
     * @param params - ProcessParams object with extra attrs for this service.
     */
    process(params: ValidatePdfaProcessParams) {
        return super.process(params);
    }

}