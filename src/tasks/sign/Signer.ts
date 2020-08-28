import { SignatureFileI, SignatureFileJSON } from "./SignatureFile";
import FileAlreadyExistsError from "../../errors/FileAlreadyExistsError";
import SignerStatus from "../../types/responses/SignerStatus";

export interface SignerI {
    /**
     * Signer name.
     */
    readonly name: string;
    /**
     * Signer email.
     */
    email: string;
    /**
     * Signer status.
     */
    status: SignerStatus;
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
     * Updates signer status and fires 'update.status' event.
     */
    updateStatus: (status: SignerStatus) => Promise<void>;
    /**
     * Updates signer phone and fires 'update.phone' event.
     */
    updatePhone: (phone: string) => Promise<void>;
    /**
     * Updates signer email and fires 'update.email' event.
     */
    updateEmail: (email: string) => Promise<void>;
    /**
     * Adds an event that fires on specific event type.
     */
    addEvent: <T extends keyof ListenerEventMap>(eventType: T, listener: ListenerEventMap[T]) => void;
    /**
     * Removes an event that fires on specific event type.
     */
    removeEvent: <T extends keyof ListenerEventMap>(eventType: T, listener: ListenerEventMap[T]) => void;
    /**
     * Creates a JSON response to append as a body in a HTTP request.
     */
    toJSON: () => SignerJSON;
}

export default class Signer implements SignerI {
    public readonly name: string;
    public email: string;
    public status: SignerStatus;
    public readonly params: SignerParams;
    public readonly files: Array<SignatureFileI>;

    public token_signer: string;
    public token_requester: string;

    private events: Events;

    constructor(name: string, email: string, params: SignerParams = {}) {
        this.name = name;
        this.email = email;
        this.status = 'waiting';
        this.params = params;
        this.files = [];
        this.token_signer = '';
        this.token_requester = '';
        this.events = {};
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

    public async updateStatus(status: SignerStatus) {
        await this.fireEvent('update.status', this, status);
        this.status = status;
    }

    public async updatePhone(phone: string) {
        await this.fireEvent('update.phone', this, phone);
        this.params.phone = phone;
    }

    public async updateEmail(email: string) {
        await this.fireEvent('update.email', this, email);
        this.email = email;
    }

    public addEvent<T extends keyof ListenerEventMap>(eventType: T, listener: ListenerEventMap[T]) {
        if (!this.events[eventType]) this.events[eventType] = [];

        this.events[eventType].push(listener);
    }

    public removeEvent<T extends keyof ListenerEventMap>(eventType: T, listener: ListenerEventMap[T]) {
        if (!this.events[eventType]) return;

        const index = this.events[eventType].indexOf(listener);
        if (index !== -1) this.events[eventType].splice(index, 1);
    }

    private async fireEvent<T extends keyof ListenerEventMap>(eventType: T, ...args: Parameters<ListenerEventMap[T]>) {
        if (!this.events[eventType]) return;

        for (const listener of this.events[eventType]) {
            await listener(...args);
        }

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
    phone?: string;
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

type Events = { [eventType: string]: Array<Function> };

interface ListenerEventMap {
    'update.phone': UpdateStringEvent,
    'update.email': UpdateStringEvent,
    'update.status': UpdateStatusEvent
}

type UpdateStringEvent = (signer: SignerI, field: string) => Promise<any>;

type UpdateStatusEvent = (signer: SignerI, status: SignerStatus) => Promise<any>;