import Element, { ElementParams } from "./Element";

export interface TextParams extends ElementParams {
    type: 'text';
    text: string;
    text_align?: string;
    font_family?: 'Arial' | 'Arial Unicode MS' | 'Verdana' | 'Courier' | 'Times New Roman' | 'Comic Sans MS' | 'WenQuanYi Zen Hei' | 'Lohit Marathi';
    font_size?: number;
    font_style?: 'null' | 'Bold' | 'Italic';
    font_color?: string;
    letter_spacing?: number;
    underline_text?: boolean;
}

export default class Text extends Element {

    constructor(params: Omit<TextParams, 'type'>) {
        super({
            ...params,
            type: 'text',
        });
    }

}