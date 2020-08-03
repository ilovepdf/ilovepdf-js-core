import Task, { ProcessParams } from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";

interface WatermarkProcessParams extends ProcessParams {
    mode?: 'text' | 'image';
    text?: string;
    image?: string;
    pages?: string;
    vertical_position?: 'bottom' | 'top' | 'middle';
    horizontal_position?: 'left' | 'center' | 'right';
    vertical_position_adjustment?: number;
    horizontal_position_adjustment?: number;
    mosaic?: boolean;
    rotation?: number;
    font_family?: 'Arial' | 'Arial Unicode MS' | 'Verdana' | 'Courier' | 'Times New Roman' | 'Comic Sans MS' | 'WenQuanYi Zen Hei' | 'Lohit Marathi';
    font_style?: 'null' | 'Bold' | 'Italic';
    font_size?: number;
    font_color?: string;
    transparency?: number;
    layer?: 'above' | 'below';
}

export default class WatermarkTask extends Task {
    public type: ILovePDFTool;

    constructor(auth: Auth, params: TaskParams = {}) {
        super(auth, params);

        this.type = 'watermark';
    }

    /**
     * @inheritdoc
     * @override
     * @param params - ProcessParams object with extra attrs for this service.
     */
    process(params?: WatermarkProcessParams) {
        return super.process(params);
    }

}