import Task from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";
import XHRInterface from "../utils/XHRInterface";
import { ProcessParams } from "./TaskI";

interface PdfJpgProcessParams extends ProcessParams {
    // If 'pages' is chosen, converts every PDF page to a JPG image.
    // If 'extract' is chosen, extract all PDFs embedded images to separates JPG images.
    pdfjpg_mode?: 'pages' | 'extract';
    dpi?: number;
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