import Task, { ProcessParams } from "./Task";
import ILovePDFTool from "./types/ILovePDFTool";
import { TaskParams } from './Task';

interface PdfJpgProcessParams extends ProcessParams {
    pdfjpg_mode?: 'pages' | 'extract';
}

export default class PdfJpgTask extends Task {
    public type: ILovePDFTool;

    constructor(publicKey: string, secretKey: string, params: TaskParams = {}) {
        super(publicKey, secretKey, params);

        this.type = 'pdfjpg';
    }

    /**
     * @inheritdoc
     * @override
     * @param params - ProcessParams object with extra attrs for this service.
     */
    process(params?: PdfJpgProcessParams) {
        return super.process(params);
    }

}