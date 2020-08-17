import Task from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";
import XHRInterface from "../utils/XHRInterface";
import { ProcessParams } from "./Task";

interface SplitProcessParams extends ProcessParams {
    // Sets how to split the document.
    split_mode?: 'ranges' | 'fixed_range' | 'remove_pages';
    // Page ranges to split the files. Every range will be saved
    // as different PDF files.
    ranges?: string;
    // Split the PDF file in chunks by every defined number.
    fixed_range?: number;
    // Pages to remove from PDF.
    remove_pages?: string;
    // Merges all ranges after being split.
    merge_after?: boolean;
}

export default class SplitTask extends Task {
    public type: ILovePDFTool;

    constructor(auth: Auth, xhr: XHRInterface , params: TaskParams = {}) {
        super(auth, xhr, params);

        this.type = 'split';
    }

    /**
     * @inheritdoc
     * @override
     * @param params - ProcessParams object with extra attrs for this service.
     */
    process(params?: SplitProcessParams) {
        return super.process(params);
    }

}