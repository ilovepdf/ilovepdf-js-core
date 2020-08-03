import Task, { ProcessParams } from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";
import XHRInterface from "../utils/XHRInterface";

interface PdfJpgProcessParams extends ProcessParams {
    pdfjpg_mode?: 'pages' | 'extract';
}

export default class PdfJpgTask extends Task {
    public type: ILovePDFTool;

    constructor(auth: Auth, xhr: XHRInterface , params: TaskParams = {}) {
        super(auth, xhr, params);

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