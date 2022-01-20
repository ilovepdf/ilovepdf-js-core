import SignatureFile, { SignatureFileI, SignatureFileJSON } from "./SignatureFile";
import SignatureStatus from "../../types/responses/SignatureStatus";
import GetSignerResponse from "../../types/responses/GetSignerResponse";
import ElementAlreadyExistsError from "../../errors/ElementAlreadyExistsError";
import ElementNotExistsError from "../../errors/ElementNotExistError";

export interface SignerI {
    /**
     * Signer name.
     */
    readonly name: string;
    /**
     * Signer email.
     */
    readonly email: string;
    /**
     * Signer optional parameters.
     */
    readonly params: SignerParams;
    /**
     * Associated signature files.
     */
    readonly files: Array<SignatureFileI>;
    /**
     * Token of this signer. It is filled by the system on
     * process a signature process.
     */
    token_signer: string;
    /**
     * Token of this signer. It is filled by the system on
     * process a signature process.
     */
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
    public readonly name: string;
    public readonly params: SignerParams;
    public readonly files: Array<SignatureFileI>;

    public token_signer: string;
    public token_requester: string;

    private _email: string;
    private events: Events;

    constructor(name: string, email: string, params: SignerParams = {}) {
        this.name = name;
        this._email = email;
        this.params = params;
        this.files = [];
        this.token_signer = '';
        this.token_requester = '';
        this.events = {};
    }

    get email() {
        return this._email;
    }

    public addFile(file: SignatureFileI) {
        const index = this.files.indexOf(file);
        if (index !== -1) throw new ElementAlreadyExistsError();

        this.files.push(file);
    }

    public deleteFile(file: SignatureFileI) {
        const index = this.files.indexOf(file);

        if (index === -1) {
            throw new ElementNotExistsError();
        }

        this.files.splice(index, 1);
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

    public static from(signerJSON: GetSignerResponse): Signer {
        const { name, email, access_code, custom_int, custom_string,
                force_signature_type, phone, type, files = [],
                token_requester, token_signer } = signerJSON;

        // Define signer.
        const signer = new Signer(name, email, {
            access_code,
            custom_int,
            custom_string,
            force_signature_type,
            phone,
            type
        });

        // Inject response data.
        signer.token_requester = token_requester;
        signer.token_signer = !!token_signer ? token_signer : '';

        // Add its files.
        files?.forEach(file => {
            const signFile = SignatureFile.from(file);
            signer.addFile(signFile);
        });

        return signer;
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

type Events = { [eventType: string]: Array<Function> };

interface ListenerEventMap {
    'update.phone': UpdateStringEvent,
    'update.email': UpdateStringEvent,
    'update.status': UpdateStatusEvent
}

type UpdateStringEvent = (signer: SignerI, field: string) => Promise<any>;

type UpdateStatusEvent = (signer: SignerI, status: SignatureStatus) => Promise<any>;