import BaseFile from "../../BaseFile";
import SignatureElement from "./SignatureElement";

export default class SignatureFile {
    serverFilename: string;
    elements: Array<SignatureElement>;

    constructor(file: BaseFile, elements: Array<SignatureElement> = []) {
        this.serverFilename = file.serverFilename;
        this.elements = elements;
    }

    toJSON(): SignatureFileJSON {
        return {
            server_filename: this.serverFilename,
            elements: this.elements
        };
    }

}

export type SignatureFileJSON = {
    /**
     * PDF filename inside the server where it is associated.
     */
    server_filename: string;
    /**
     * Signature elements associated with a pdf file.
     */
    elements: Array<SignatureElement>;
};