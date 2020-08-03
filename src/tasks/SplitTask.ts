import Task, { ProcessParams } from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";

interface SplitProcessParams extends ProcessParams {
    split_mode?: 'ranges' | 'fixed_range' | 'remove_pages';
    ranges?: string;
    fixed_range?: number;
    remove_pages?: string;
    merge_after?: boolean;
}

export default class SplitTask extends Task {
    public type: ILovePDFTool;

    constructor(auth: Auth, params: TaskParams = {}) {
        super(auth, params);

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