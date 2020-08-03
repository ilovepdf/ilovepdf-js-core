import Task, { ProcessParams } from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";

interface ImagePdfProcessParams extends ProcessParams {
    orientation?: 'portrait' | 'landscape';
    margin?: number;
    pagesize?: 'fit' | 'A4' | 'letter';
    merge_after?: boolean;
}

export default class ImagePdfTask extends Task {
    public type: ILovePDFTool;

    constructor(auth: Auth, params: TaskParams = {}) {
        super(auth, params);

        this.type = 'imagepdf';
    }

    /**
     * @inheritdoc
     * @override
     * @param params - ProcessParams object with extra attrs for this service.
     */
    process(params?: ImagePdfProcessParams) {
        return super.process(params);
    }

}