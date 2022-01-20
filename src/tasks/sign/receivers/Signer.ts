import SignatureFile, { SignatureFileJSON } from "../elements/SignatureFile";
import ElementAlreadyExistsError from "../../../errors/ElementAlreadyExistsError";

export default class Signer {
    public readonly name: string;
    public readonly params: SignerParams;
    public readonly files: Array<SignatureFile>;

    private _email: string;

    constructor(name: string, email: string, params: SignerParams = {}) {
        this.name = name;
        this._email = email;
        this.params = params;
        this.files = [];
    }

    get email() {
        return this._email;
    }

    public addFile(file: SignatureFile) {
        const index = this.files.indexOf(file);
        if (index !== -1) throw new ElementAlreadyExistsError();

        this.files.push(file);
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
    phone?: string;
    /**
    * Type of Signer:
    * signer: Person who has to sign the document.
    * validator: Person who accepts or rejects the document.
    * witness: Person who can access and see the document.
    */
    type?: 'signer' | 'validator' | 'witness';
    /**
     * Number to filter in the GET /signer resource.
     */
    custom_int?: number;
    /**
     * String to filter in the GET /signer resource.
     */
    custom_string?: string;
    /**
     * Defines a code to view the document.
     */
    access_code?: string;
    /**
     * Accepted signature types.
     */
    force_signature_type?: 'all' | 'text' | 'sign' | 'image';
};

export interface SignerJSON {
    /**
     * Signer full name.
     */
    name: string;
    /**
     * Signer email.
     */
    email: string;
    phone?: string;
    /**
     * Type of Signer:
     * signer: Person who has to sign the document.
     * validator: Person who accepts or rejects the document.
     * witness: Person who can access and see the document.
     */
    type?: 'signer' | 'validator' | 'witness';
    /**
     * Number to filter in the GET /signer resource.
     */
    custom_int?: number;
    /**
     * String to filter in the GET /signer resource.
     */
    custom_string?: string;
    /**
     * Defines a code to view the document.
     */
    access_code?: string;
    /**
     * Accepted signature types.
     */
    force_signature_type?: 'all' | 'text' | 'sign' | 'image';
    /**
     * Associated PDF files.
     */
    files?: Array<SignatureFileJSON> | null;
};
