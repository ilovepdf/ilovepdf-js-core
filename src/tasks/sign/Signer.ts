import { SignatureFileI, SignatureFileJSON } from "./SignatureFile";
import FileAlreadyExistsError from "../../errors/FileAlreadyExistsError";

export interface SignerI {
    // Signer name.
    name: string;
    // Signer email.
    email: string;
    // Signer optional parameters.
    params: SignerParams;
    // Associated signature files.
    readonly files: Array<SignatureFileI>;
    // Token of this signer. It is filled by the system on
    // process a signature process.
    token_signer: string;
    // Token of this signer. It is filled by the system on
    // process a signature process.
    token_requester: string;
    /**
     * Adds a file to the signer. If exists, throws an error.
     * @param file - File to add.
     */
    addFile: (file: SignatureFileI) => void;
    /**
     * Deletes a file previously added. If not exist does not do anything.
     * @param file - File to add.
     */
    deleteFile: (file: SignatureFileI) => void;
    /**
     * Creates a JSON response to append as a body in a HTTP request.
     */
    toJSON: () => SignerJSON;
}

export default class Signer implements SignerI {
    public name: string;
    public email: string;
    public params: SignerParams;
    public readonly files: Array<SignatureFileI>;
    public token_signer: string;
    public token_requester: string;

    constructor(name: string, email: string, params: SignerParams = {}) {
        this.name = name;
        this.email = email;
        this.params = params;
        this.files = [];
        this.token_signer = '';
        this.token_requester = '';
    }

    public addFile(file: SignatureFileI) {
        const index = this.files.indexOf(file);
        if (index !== -1) throw new FileAlreadyExistsError();

        this.files.push(file);
    }

    public deleteFile(file: SignatureFileI) {
        const index = this.files.indexOf(file);
        if (index !== -1) this.files.splice(index, 1);
    }

    public toJSON(): SignerJSON {
        const files = this.files.map(file => file.toJSON());

        return {
            name: this.name,
            email: this.email,
            ...this.params,
            files
        };
    }

}

export type SignerParams = {
   /**
    * Type of Signer:
    * signer: Person who has to sign the document.
    * validator: Person who accepts or rejects the document.
    * witness: Person who can access and see the document.
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

export interface SignerJSON {
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
    // Associated PDF files.
    files?: Array<SignatureFileJSON>
};