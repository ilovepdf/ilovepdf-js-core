import BaseFile from "../BaseFile";
import SignatureElement from "./SignatureElement";

export default class SignatureFile {
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

    public static from(signatureFileJSON: SignatureFileJSON): SignatureFile {
        const { elements, server_filename } = signatureFileJSON;

        const file = new BaseFile('', server_filename);

        const signatureFile = new SignatureFile(file, elements);
        return signatureFile;
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