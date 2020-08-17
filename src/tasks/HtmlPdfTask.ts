import Task from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";
import XHRInterface from "../utils/XHRInterface";
import { ProcessParams } from "./Task";

interface HtmlPdfProcessParams extends ProcessParams {
    view_width?: number;
    view_height?: number;
    navigation_timeout?: number;
    delay?: number;
    page_size?: 'A3' | 'A4' | 'A5' | 'A6' | 'Letter';
    page_orientation?: 'portrait' | 'landscape';
    page_margin?: number;
    remove_popups?: boolean;
    single_page?: boolean;
}

export default class HtmlPdfTask extends Task {
    public type: ILovePDFTool;

    constructor(auth: Auth, xhr: XHRInterface , params: TaskParams = {}) {
        super(auth, xhr, params);

        this.type = 'htmlpdf';
    }

    /**
     * @inheritdoc
     * @override
     * @param params - ProcessParams object with extra attrs for this service.
     */
    process(params?: HtmlPdfProcessParams) {
        return super.process(params);
    }

}