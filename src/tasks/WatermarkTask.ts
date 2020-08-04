import Task, { ProcessParams } from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";
import XHRInterface from "../utils/XHRInterface";

interface WatermarkProcessParams extends ProcessParams {
    // Text if only text it will be inserted. The same with image mode.
    mode?: 'text' | 'image';
    // Text to be stamped. If mode is image this value does not take effect.
    // If mode is text this value is required.
    text?: string;
    // The image to stamp if mode is image.
    // The stamp image must be uploaded in the /upload resource.
    // This image parameter must referer to the server_filename (JPG or PNG) to stamp in the PDF.
    image?: string;
    // Pages to be stamped.
    pages?: string;
    vertical_position?: 'bottom' | 'top' | 'middle';
    horizontal_position?: 'left' | 'center' | 'right';
    // Adjusts how much pixels have to modify the position defined in vertical_position,
    // it accepts positive and negative values.
    vertical_position_adjustment?: number;
    // Adjusts how much pixels have to modify the position defined in horizontal_position,
    // it accepts positive and negative values.
    horizontal_position_adjustment?: number;
    // If true, this value overrides all position parameters and stamps the
    // image or text 9 times per page.
    mosaic?: boolean;
    // Angle of rotation. Accepted integer range: 0-360.
    rotation?: number;
    font_family?: 'Arial' | 'Arial Unicode MS' | 'Verdana' | 'Courier' | 'Times New Roman' | 'Comic Sans MS' | 'WenQuanYi Zen Hei' | 'Lohit Marathi';
    font_style?: 'null' | 'Bold' | 'Italic';
    font_size?: number;
    font_color?: string;
    // Percentage of opacity for stamping text or image.
    // Accepted integer range 1-100.
    transparency?: number;
    // If above is chosen, places stamp over content.
    // if below is chosen, places stamp below content.
    layer?: 'above' | 'below';
}

export default class WatermarkTask extends Task {
    public type: ILovePDFTool;

    constructor(auth: Auth, xhr: XHRInterface , params: TaskParams = {}) {
        super(auth, xhr, params);

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