import Element, { ElementParams } from "./Element";

export interface SvgParams extends ElementParams {
    server_filename: string;
}

export default class Svg extends Element {

    constructor(params: Omit<SvgParams, 'type'>) {
        super({
            ...params,
            type: 'svg',
        });
    }

}