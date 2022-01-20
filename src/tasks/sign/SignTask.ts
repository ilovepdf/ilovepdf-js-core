import Task from "../Task";
import ILovePDFTool from "../../types/ILovePDFTool";
import { TaskParams } from '../Task';
import Auth from "../../auth/Auth";
import XHRInterface from "../../utils/XHRInterface";
import globals from '../../constants/globals.json';
import Requester from "./Requester";
import { SignerI } from "./Signer";
import SignerAlreadyExistsError from "../../errors/SignerAlreadyExistsError";
import { ResponsesI } from "../TaskI";
import SignatureStatus from "../../types/responses/SignatureStatus";
import GetSignerResponse from "../../types/responses/GetSignerResponse";
import { GetSignatureStatus } from "../../ILovePDFCoreApi";

export interface SignProcessParams {
    /**
     * Emails language that will be received by signers.
     */
    language?: 'EN' | 'ES' | 'FR' | 'IT' | 'JA' | 'ZH-CN' | 'ZH-TW' | 'BG';
    /**
     * If true, allow signers to sign in parallel. Otherwise, do it sequentially.
     */
    lock_order?: boolean;
    /**
     * Days until the signature request will expire.
     */
    expiration_date?: number;
    /**
     * If true, a signed certified hash and a qualified timestamp is embedded to
     * the signed documents, ensuring document and signatures integrity in the
     * future. Certified signatures are eIDAS, ESIGN & UETA compliant.
     */
    certified?: boolean;
    /**
     * Requester number to facilitate filtering.
     */
    custom_int?: number;
    /**
     * Requester string to facilitate filtering.
     */
    custom_string?: string;
    /**
     * single: The signer is only one and no requests will be sent.
     * multiple: A signature request will be sent to the signers by a requester.
     *           All signers sign the same document.
     */
    mode?: 'single' | 'multiple';
    /**
     * If true, displays UUID at the bottom of the signature. Otherwise, it is hidden.
     * This has only aesthetic purposes.
     */
    uuid_visible?: boolean;
    /**
     * Enables signature reminders.
     */
    reminders?: boolean;
    /**
     * If 'reminders' is true, reminders cycle can be set.
     * 1 <= signer_reminder_days_cycle <= expiration_days.
     */
    signer_reminder_days_cycle?: number;
}

interface SignTaskParams extends TaskParams {
    token?: string;
    requester?: Requester;
    signers?: Array<SignerI>;
}

export default class SignTask extends Task {
    public type: ILovePDFTool;
    public requester: Requester | null;
    public token: string | null;
    public readonly signers: Array<SignerI>;
    public readonly responses: ResponsesI;

    constructor(auth: Auth, xhr: XHRInterface , params: SignTaskParams = {}) {
        super(auth, xhr, params);

        this.type = 'sign';
        this.token = !!params.token ? params.token : null;
        this.requester = !!params.requester ? params.requester : null;
        this.signers = !!params.signers ? params.signers : [];

        this.responses = {
            start: null,
            addFile: null,
            deleteFile: null,
            process: null,
            download: null,
            delete: null,
            connect: null
        }
    }

    public async process(params: SignProcessParams = {}): Promise<ProcessReturn> {
        const token = await this.auth.getToken();

        const body = this.createSignatureData(params);

        const data = await this.xhr.post<ProcessReturn>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/signature`,
            body,
            {
                headers: [
                    [ 'Content-Type', 'application/json;charset=UTF-8' ],
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: res => { return JSON.parse(res) }
            }
        );

        // Keep response.
        this.responses.process = [ data ];

        return data;
    }

    /**
     * Creates a signature object as string to send to server.
     * @param params - Params to create a custom signature.
     */
    private createSignatureData(params: SignProcessParams): string {
        // Convert to files request format.
        const files = this.getFilesBodyFormat();

        const signers = this.signers.map(signer => (
            signer.toJSON()
        ));

        return JSON.stringify(
            {
                task: this.id,
                files,
                ...this.requester,
                signers,
                // Include optional params.
                ...params
            }
        );
    }

    public addSigner(signer: SignerI) {
        const index = this.signers.indexOf(signer);
        if (index !== -1) throw new SignerAlreadyExistsError();
        // Add signers to manage instance changes.
        this.signers.push(signer);
    }

}

type ProcessReturn = GetSignatureStatus;