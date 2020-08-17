import Task from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";
import XHRInterface from "../utils/XHRInterface";
import { ProcessParams } from "./Task";

interface PageNumberProcessParams extends ProcessParams {
    // PDF is in facing page or not.
    facing_pages?: boolean;
    // PDF is cover or not.
    first_cover?: boolean;
    // Pages to be numbered. Accepted formats:
    // all
    // 3-end
    // 1,3,4-9
    // -2-end
    // 3-234
    pages?: string;
    // Start page numbering with this number.
    starting_number?: number;
    vertical_position?: 'bottom' | 'top';
    horizontal_position?: 'left' | 'center' | 'right';
    // Adjusts how much pixels have to modify the position defined in vertical_position,
    // it accepts positive and negative values.
    vertical_position_adjustment?: number;
    // Adjusts how much pixels have to modify the position defined in horizontal_position,
    // it accepts positive and negative values.
    horizontal_position_adjustment?: number;
    font_family?: 'Arial' | 'Arial Unicode MS' | 'Verdana' | 'Courier' | 'Times New Roman' | 'Comic Sans MS' | 'WenQuanYi Zen Hei' | 'Lohit Marathi';
    font_style?: 'null' | 'Bold' | 'Italic';
    font_size?: number;
    font_color?: string;
    // To define text in addition of a number use {n} for current page number and {p}
    // for total pages number for the file.
    // Example Page {n} of {p}. If null only page number will be placed.
    text?: string;
}

export default class PageNumberTask extends Task {
    public type: ILovePDFTool;

    constructor(auth: Auth, xhr: XHRInterface , params: TaskParams = {}) {
        super(auth, xhr, params);

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