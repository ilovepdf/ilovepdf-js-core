import BaseFile from "../BaseFile";
import SignatureElement from "./SignatureElement";

export interface SignatureFileI {
    // PDF filename inside the server where it is associated.
    serverFilename: string;
    // Signature elements associated with a pdf file.
    elements: Array<SignatureElement>;
    /**
     * Creates a JSON response to append as a body in a HTTP request.
     */
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
    // PDF filename inside the server where it is associated.
    server_filename: string;
    // Signature elements associated with a pdf file.
    elements: Array<SignatureElement>;
};