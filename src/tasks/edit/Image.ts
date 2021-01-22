import BaseFile from "../BaseFile";
import Element, { ElementParams } from "./Element";

export interface ImageParams extends ElementParams {
    type: 'image',
    server_filename: string;
}

// I want to create this class using a BaseFile to avoid new ways to do the same (upload a file).
type ImageParamsFromFile = Omit<ImageParams, 'type' | 'server_filename'> & { file: BaseFile };

export default class Image extends Element {

    constructor(params: ImageParamsFromFile) {
        // Deconstruct to remove 'file' and set the properties
        // that will be sent to the endpoint.
        const { file, ...others} = params;

        super({
            ...others,
            type: 'image',
            server_filename: file.serverFilename,
        } as ImageParams);
    }

}