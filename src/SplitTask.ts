import Task, { ProcessParams } from "./Task";
import ILovePDFTool from "./types/ILovePDFTool";
import { TaskParams } from './Task';

interface SplitProcessParams extends ProcessParams {
    split_mode?: 'ranges' | 'fixed_range' | 'remove_pages';
    ranges?: string;
    fixed_range?: number;
    remove_pages?: string;
    merge_after?: boolean;
}

export default class SplitTask extends Task {
    public type: ILovePDFTool;

    constructor(publicKey: string, secretKey: string, params: TaskParams = {}) {
        super(publicKey, secretKey, params);

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