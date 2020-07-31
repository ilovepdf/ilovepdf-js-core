import Task, { ProcessParams } from "./Task";
import ILovePDFTool from "./types/ILovePDFTool";
import { TaskParams } from './Task';

interface ImagePdfProcessParams extends ProcessParams {
    orientation?: 'portrait' | 'landscape';
    margin?: number;
    pagesize?: 'fit' | 'A4' | 'letter';
    merge_after?: boolean;
}

export default class ImagePdfTask extends Task {
    public type: ILovePDFTool;

    constructor(publicKey: string, secretKey: string, params: TaskParams = {}) {
        super(publicKey, secretKey, params);

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