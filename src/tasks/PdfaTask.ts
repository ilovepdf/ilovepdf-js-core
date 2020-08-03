import Task, { ProcessParams } from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";

interface PdfaProcessParams extends ProcessParams {
    conformance?: 'pdfa-1b' | 'pdfa-1a' | 'pdfa-2b' | 'pdfa-2u' | 'pdfa-2a' | 'pdfa-3b' | 'pdfa-3u' | 'pdfa-3a';
}

export default class PdfaTask extends Task {
    public type: ILovePDFTool;

    constructor(auth: Auth, params: TaskParams = {}) {
        super(auth, params);

        this.type = 'pdfa';
    }

    /**
     * @inheritdoc
     * @override
     * @param params - ProcessParams object with extra attrs for this service.
     */
    process(params?: PdfaProcessParams) {
        return super.process(params);
    }

}