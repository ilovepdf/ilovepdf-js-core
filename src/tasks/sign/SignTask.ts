import Task from "../Task";
import ILovePDFTool from "../../types/ILovePDFTool";
import { TaskParams } from '../Task';
import Auth from "../../auth/Auth";
import XHRInterface from "../../utils/XHRInterface";
import globals from '../../constants/globals.json';
import Requester from "./Requester";
import { SignerI } from "./Signer";
import SignerAlreadyExistsError from "../../errors/SignerAlreadyExistsError";
import TaskI, { ResponsesI } from "../TaskI";
import SignatureProcessResponse from "../../types/responses/SignatureProcessResponse";
import SignatureStatus from "../../types/responses/SignatureStatus";
import GetSignerResponse from "../../types/responses/GetSignerResponse";

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

interface Responses extends ResponsesI {
    process: Array<SignatureProcessResponse> | null;
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
    public readonly responses: Responses;

    constructor(auth: Auth, xhr: XHRInterface , params: SignTaskParams = {}) {
        super(auth, xhr, params);

        // Bindings.
        this.updateSignerPhone = this.updateSignerPhone.bind(this);
        this.updateSignerEmail = this.updateSignerEmail.bind(this);
        this.updateSignerStatus = this.updateSignerStatus.bind(this);

        this.type = 'sign';
        this.token = !!params.token ? params.token : null;
        this.requester = !!params.requester ? params.requester : null;
        this.signers = !!params.signers ? params.signers : [];
        this.addSignerListeners(this.signers);

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

    public async process(params: SignProcessParams = {}): Promise<TaskI> {
        const data = this.createSignatureData(params);

        return this.processWithData(data)
            .then( task => {
                const responsesLength = this.responses.process!.length;
                const lastResponse = this.responses.process![ responsesLength - 1 ];
                // Keep the token invariant.
                this.token = lastResponse.token_requester;

                return task;
            } );
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

    private fillSignerTokens(responseSigners: Array<GetSignerResponse>) {

        this.signers.forEach((signer, index) => {
            const { token_signer, token_requester } = responseSigners[index];
            signer.token_signer = token_signer || '';
            signer.token_requester = token_requester;
        })

    }

    private async processWithData(processData: any) {
        const token = await this.auth.getToken();

        return this.xhr.post<SignatureProcessResponse | SignatureProcessResponse[]>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/signature`,
            processData,
            {
                headers: [
                    [ 'Content-Type', 'application/json;charset=UTF-8' ],
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: res => { return JSON.parse(res) }
            }
        )
        .then((data) => {
            // Maintain a consistency returning always an array
            // with signatures.
            if (Array.isArray(data)) {
                data.forEach(signature => {
                    this.fillSignerTokens(signature.signers);
                });

                // Keep response.
                this.responses.process = data;
            }
            else {
                this.fillSignerTokens(data.signers);
                // Keep response.
                this.responses.process = [ data ];
            }

            return this;
        });
    }

    public addSigner(signer: SignerI) {
        const index = this.signers.indexOf(signer);
        if (index !== -1) throw new SignerAlreadyExistsError();
        // Add signers to manage instance changes.
        this.addSignerListeners([ signer ]);
        this.signers.push(signer);
    }

    public deleteSigner(signer: SignerI) {
        const index = this.signers.indexOf(signer);

        if (index !== -1) {
            // Remove listeners for garbage collector.
            this.removeSignerListeners([ signer ]);
            this.signers.splice(index, 1);
        }

    }

    private addSignerListeners(signers: Array<SignerI>) {
        signers.forEach(signer => {
            signer.addEventListener('update.phone', this.updateSignerPhone);
            signer.addEventListener('update.email', this.updateSignerEmail);
            signer.addEventListener('update.status', this.updateSignerStatus);
        });
    }

    private removeSignerListeners(signers: Array<SignerI>) {
        signers.forEach(signer => {
            signer.removeEventListener('update.phone', this.updateSignerPhone);
            signer.removeEventListener('update.email', this.updateSignerEmail);
            signer.removeEventListener('update.status', this.updateSignerStatus);
        });
    }

    private async updateSignerPhone(signer: SignerI, phone: string): Promise<unknown> {
        const data = JSON.stringify({ phone });

        return this.updateSignerField(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/signature/signer/fix-phone/${ signer.token_requester }`,
            data
        );
    }

    private async updateSignerEmail(signer: SignerI, email: string): Promise<unknown> {
        const data = JSON.stringify({ email });

        return this.updateSignerField(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/signature/signer/fix-email/${ signer.token_requester }`,
            data
        );
    }

    private async updateSignerStatus(signer: SignerI, status: SignatureStatus): Promise<unknown> {
        const data = JSON.stringify({ status });

        return this.updateSignerField(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/signature/signer/${ signer.token_signer }`,
            data
        );
    }

    private async updateSignerField(url: string, data: string): Promise<unknown> {
        const token = await this.auth.getToken();

        return this.xhr.put(
            url,
            data,
            {
                headers: [
                    [ 'Content-Type', 'application/json;charset=UTF-8' ],
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: res => { return JSON.parse(res) }
            }
        );
    }

}
