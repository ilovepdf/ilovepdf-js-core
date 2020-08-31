import Task from "../Task";
import ILovePDFTool from "../../types/ILovePDFTool";
import { TaskParams } from '../Task';
import Auth from "../../auth/Auth";
import XHRInterface from "../../utils/XHRInterface";
import globals from '../../constants/globals.json';
import Requester from "./Requester";
import { SignerI } from "./Signer";
import SignerAlreadyExistsError from "../../errors/SignerAlreadyExistsError";
import TaskI, { ResponsesI, StatusI } from "../TaskI";
import SignatureFile from "./SignatureFile";
import SignatureProcessResponse from "../../types/responses/SignatureProcessResponse";
import { isArray } from "util";
import SignatureStatus from "../../types/responses/SignatureStatus";
import GetSignerResponse from "../../types/responses/GetSignerResponse";

export interface SignProcessParams {
    // Emails language that will be received by signers.
    language?: 'EN' | 'ES' | 'FR' | 'IT' | 'JA' | 'ZH-CN' | 'ZH-TW' | 'BG';
    // If true, allow signers to sign in parallel. Otherwise, do it sequentially.
    lock_order?: boolean;
    // Days until the signature request will expire.
    expiration_date?: number;
    // If true, a signed certified hash and a qualified timestamp is embedded to
    // the signed documents, ensuring document and signatures integrity in the
    // future. Certified signatures are eIDAS, ESIGN & UETA compliant.
    certified?: boolean;
    // Requester number to facilitate filtering.
    custom_int?: number;
    // Requester string to facilitate filtering.
    custom_string?: string;
    /**
     * single: The signer is only one and no requests will be sent.
     * multiple: A signature request will be sent to the signers by a requester.
     *           All signers sign the same document.
     * batch: A signature request will be sent to the signers by a requester.
     *        Every signer sign the document separately.
     */
    mode?: 'single' | 'multiple' | 'batch';
    // REQUIRED if 'batch' mode is enabled.
    // Each file that needs to be signed by each signer.
    batch_elements?: Array<SignatureFile>;
    // If true, displays UUID at the bottom of the signature. Otherwise, it is hidden.
    // This has only aesthetic purposes.
    uuid_visible?: boolean;
}

export interface SignTemplateParams extends SignProcessParams {
    template_name: string;
}

interface Responses extends ResponsesI {
    process: Array<SignatureProcessResponse> | null;
}

interface Status extends StatusI {
    document: SignatureStatus;
    signers: {
        [email: string]: {
            email_status: number;
            phone_status: number;
        }
    };
}

interface SignTaskParams extends TaskParams {
    requester?: Requester;
    signers?: Array<SignerI>;
}

export default class SignTask extends Task {
    public type: ILovePDFTool;
    public requester: Requester | null;
    public readonly signers: Array<SignerI>;
    public readonly responses: Responses;

    constructor(auth: Auth, xhr: XHRInterface , params: SignTaskParams = {}) {
        super(auth, xhr, params);

        this.type = 'sign';
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

        // Binding.
        this.updateSignerPhone = this.updateSignerPhone.bind(this);
        this.updateSignerEmail = this.updateSignerEmail.bind(this);
        this.updateSignerStatus = this.updateSignerStatus.bind(this);
    }

    /**
     * @inheritdoc
     */
    public async getStatus(): Promise<Status> {
        const token = await this.auth.getToken();

        const response = await this.xhr.get<SignatureProcessResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/signature/${ this.id }`,
            {
                headers: [
                    [ 'Content-Type', 'application/json;charset=UTF-8' ],
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: res => { return JSON.parse(res) }
            }
        );

        const status: Status = {
            document: response.status,
            signers: {}
        };

        response.signers.forEach(signer => {
            const { email, email_status, phone_status } = signer;
            status.signers[email] = {
                email_status,
                phone_status
            };
        })

        return status;
    }

    /**
     * Saves the current task as template.
     * @param params - Template params.
     */
    public async saveAsTemplate(params: SignTemplateParams): Promise<TaskI> {
        const token = await this.auth.getToken();
        const data = this.createSignatureData(params);

        return this.xhr.post(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/signature/template`,
            data,
            {
                headers: [
                    [ 'Content-Type', 'application/json;charset=UTF-8' ],
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: res => { return JSON.parse(res) }
            }
        )
        .then(() => { return this; });
    }

    public async processFromTemplate(template: TemplateElement): Promise<TaskI> {
        return this.processWithData(template);
    }

    public async process(params: SignProcessParams = {}): Promise<TaskI> {
        const data = this.createSignatureData(params);
        return this.processWithData(data);
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

        // On batch mode, signature files are put in the root of the object.
        let batch_elements;
        if (params.mode === 'batch') batch_elements = params.batch_elements?.map(file => file.toJSON());

        return JSON.stringify(
            {
                task: this.id,
                files,
                ...this.requester,
                signers,
                batch_elements,
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
            if (isArray(data)) {
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

        this.signers.push(signer);
        signer.addEvent('update.phone', this.updateSignerPhone);
        signer.addEvent('update.email', this.updateSignerEmail);
        signer.addEvent('update.status', this.updateSignerStatus);
    }

    public deleteSigner(signer: SignerI) {
        const index = this.signers.indexOf(signer);

        if (index !== -1) {
            this.signers.splice(index, 1);
            signer.addEvent('update.phone', this.updateSignerPhone);
            signer.addEvent('update.email', this.updateSignerEmail);
            signer.addEvent('update.status', this.updateSignerStatus);
        }

    }

    private async updateSignerPhone(signer: SignerI, phone: string): Promise<unknown> {
        const data = JSON.stringify({ phone });

        return this.updateSignerField(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/signature/signer/fix-phone/${ signer.token_requester }`,
            signer,
            data
        );
    }

    private async updateSignerEmail(signer: SignerI, email: string): Promise<unknown> {
        const data = JSON.stringify({ email });

        return this.updateSignerField(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/signature/signer/fix-email/${ signer.token_requester }`,
            signer,
            data
        );
    }

    private async updateSignerStatus(signer: SignerI, status: SignatureStatus): Promise<unknown> {
        const data = JSON.stringify({ status });

        return this.updateSignerField(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/signature/signer/${ signer.token_signer }`,
            signer,
            data
        );
    }

    private async updateSignerField(url: string, signer: SignerI, data: string): Promise<unknown> {
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

export interface TemplateElement extends SignatureProcessResponse {
    template_name: string;
};
