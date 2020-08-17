import BaseFile from "../BaseFile";
import SignatureElement from "./SignatureElement";

export interface SignatureFileI {
    serverFilename: string;
    elements: Array<SignatureElement>;
    toJSON: () => SignatureFileJSON;
}

export default class SignatureFile implements SignatureFileI {
    public serverFilename: string;
    public elements: Array<SignatureElement>;

    constructor(file: BaseFile, elements: Array<SignatureElement> = []) {
        this.serverFilename = file.serverFilename;
        this.elements = elements;
    }

    public toJSON(): SignatureFileJSON {
        return {
            server_filename: this.serverFilename,
            elements: this.elements
        };
    }

}

export type SignatureFileJSON = {
    server_filename: string;
    elements: Array<SignatureElement>;
};