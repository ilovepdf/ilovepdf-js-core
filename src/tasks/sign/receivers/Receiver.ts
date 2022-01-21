import SignatureFile, { SignatureFileJSON } from "../elements/SignatureFile";
import ElementAlreadyExistsError from "../../../errors/ElementAlreadyExistsError";

export default class Receiver {
    name: string;
    params: ReceiverParams;
    files: Array<SignatureFile>;
    email: string;

    constructor(name: string, email: string, params: ReceiverParams = {}) {
        this.name = name;
        this.email = email;
        this.params = params;
        this.files = [];
    }

    addFile(file: SignatureFile) {
        const index = this.files.indexOf(file);
        if (index !== -1) throw new ElementAlreadyExistsError();

        this.files.push(file);
    }

    toJSON(): ToJson {
        const files = this.files.map(file => file.toJSON());

        return {
            name: this.name,
            email: this.email,
            files,
            ...this.params,
        };
    }

}

export type ReceiverParams = {
    phone?: string;
    /**
    * Receiver type.
    */
    type?: ReceiverType;
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
    force_signature_type?: SignatureType;
};

/**
 * @enum `signer` Receiver who signs the document.
 * @enum `validator` Receiver who validates the document and decides if
 * the signature can be finished.
 * @enum `witness` Receiver who is witness of the signature process.
 */
type ReceiverType = 'signer' | 'validator' | 'witness';

/**
 * @enum `all` Any type of signature can be chosen.
 * @enum `text` Forces only text signatures.
 * @enum `sign` Forces only digital handwrited signatures.
 * @enum `image` Forces only uploaded image signatures.
 */
type SignatureType = 'all' | 'text' | 'sign' | 'image';

type ToJson = {
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
