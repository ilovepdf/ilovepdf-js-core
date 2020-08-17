import { SignatureFileI } from "./SignatureFile";
import FileAlreadyExistsError from "../../errors/FileAlreadyExistsError";

export interface SignerI {
    name: string;
    email: string;
    params: SignerParams;
    readonly files: Array<SignatureFileI>;
    addFile: (file: SignatureFileI) => void;
    deleteFile: (file: SignatureFileI) => void;
    toJSON: () => SignerJSON;
}

export default class Signer implements SignerI {
    public name: string;
    public email: string;
    public params: SignerParams;
    public readonly files: Array<SignatureFileI>;

    constructor(name: string, email: string, params: SignerParams = {}) {
        this.name = name;
        this.email = email;
        this.params = params;
        this.files = [];
    }

    public addFile(file: SignatureFileI) {
        const index = this.files.indexOf(file);
        if (index !== -1) throw new FileAlreadyExistsError();
    }

    public deleteFile(file: SignatureFileI) {
        const index = this.files.indexOf(file);
        if (index !== -1) this.files.splice(index, 1);
    }

    public toJSON(): SignerJSON {
        return {
            name: this.name,
            email: this.email,
            ...this.params
        };
    }

}

export type SignerParams = {
   /**
    * Type of Signer:
    * signer: Person who has to sign the document.
    * validator:
    */
   type?: 'signer' | 'validator' | 'witness';
   // Number to filter in the GET /signer resource.
   custom_int?: number;
   // String to filter in the GET /signer resource.
   custom_string?: string;
   // Defines a code to view the document.
   access_code?: string;
   // Accepted signature types.
   force_signature_type?: 'all' | 'text' | 'sign' | 'image';
};

export type SignerJSON = {
    // Signer full name.
    name: string;
    // Signer email.
    email: string;
    /**
     * Type of Signer:
     * signer: Person who has to sign the document.
     * validator:
     */
    type?: 'signer' | 'validator' | 'witness';
    // Number to filter in the GET /signer resource.
    custom_int?: number;
    // String to filter in the GET /signer resource.
    custom_string?: string;
    // Defines a code to view the document.
    access_code?: string;
    // Accepted signature types.
    force_signature_type?: 'all' | 'text' | 'sign' | 'image';
};