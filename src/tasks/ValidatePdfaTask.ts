import Task from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";
import XHRInterface from "../utils/XHRInterface";
import TaskBaseProcess, { ProcessParams } from "./TaskBaseProcess";

interface ValidatePdfaProcessParams extends ProcessParams {
    // Sets the PDF/A conformance level.
    conformance?: 'pdfa-1b' | 'pdfa-1a' | 'pdfa-2b' | 'pdfa-2u' | 'pdfa-2a' | 'pdfa-3b' | 'pdfa-3u' | 'pdfa-3a';
}

export default class ValidatePdfaTask extends TaskBaseProcess {
    public type: ILovePDFTool;

    constructor(auth: Auth, xhr: XHRInterface , params: TaskParams = {}) {
        super(auth, xhr, params);

        this.type = 'validatepdfa';
    }

    /**
     * @inheritdoc
     * @override
     * @param params - ProcessParams object with extra attrs for this service.
     */
    process(params?: ValidatePdfaProcessParams) {
        return super.process(params);
    }

}