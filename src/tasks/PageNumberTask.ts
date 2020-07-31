import Task, { ProcessParams } from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';

interface PageNumberProcessParams extends ProcessParams {
    facing_pages?: boolean;
    first_cover?: boolean;
    pages?: string;
    starting_number?: number;
    vertical_position?: 'bottom' | 'top';
    horizontal_position?: 'left' | 'center' | 'right';
    vertical_position_adjustment?: number;
    horizontal_position_adjustment?: number;
    font_family?: 'Arial' | 'Arial Unicode MS' | 'Verdana' | 'Courier' | 'Times New Roman' | 'Comic Sans MS' | 'WenQuanYi Zen Hei' | 'Lohit Marathi';
    font_style?: 'null' | 'Bold' | 'Italic';
    font_size?: number;
    font_color?: string;
    text?: string;
}

export default class PageNumberTask extends Task {
    public type: ILovePDFTool;

    constructor(publicKey: string, secretKey: string, params: TaskParams = {}) {
        super(publicKey, secretKey, params);

        this.type = 'pagenumber';
    }

    /**
     * @inheritdoc
     * @override
     * @param params - ProcessParams object with extra attrs for this service.
     */
    process(params?: PageNumberProcessParams) {
        return super.process(params);
    }

}