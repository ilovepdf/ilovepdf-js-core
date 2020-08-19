import Task from "../Task";
import ILovePDFTool from "../../types/ILovePDFTool";
import { TaskParams } from '../Task';
import Auth from "../../auth/Auth";
import XHRInterface from "../../utils/XHRInterface";
import globals from '../../constants/globals.json';
import Requester from "./Requester";
import { SignerI, SignerJSON } from "./Signer";
import SignerAlreadyExistsError from "../../errors/SignerAlreadyExistsError";
import { ResponsesI } from "../TaskI";
import SignatureFile from "./SignatureFile";
import SignatureProcessResponse from "../../types/responses/SignatureProcessResponse";
import { isArray } from "util";

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
    // Each file that needs to be sign by each signer.
    batch_elements?: Array<SignatureFile>;
    // If true, displays UUID at the bottom of the signature. Otherwise, it is hidden.
    // This has only aesthetic purposes.
    uuid_visible?: boolean;
}

interface Responses extends ResponsesI {
    process: SignatureProcessResponse | null;
}

export default class SignTask extends Task {
    public type: ILovePDFTool;
    public requester: Requester | null;
    public readonly signers: Array<SignerI>;
    public readonly responses: Responses;

    constructor(auth: Auth, xhr: XHRInterface , params: TaskParams = {}) {
        super(auth, xhr, params);

        this.type = 'sign';
        this.requester = null;
        this.signers = [];
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

    // FIXME:Remove default values when server is well-configured.
    public async process(params: SignProcessParams = { mode: 'single', custom_int: null as unknown as number, custom_string: null as unknown as string }) {
        const token = await this.auth.getToken();

        // Convert to files request format.
        const files = this.getFilesBodyFormat();

        const signers = this.signers.map(signer => (
            signer.toJSON()
        ));

        const batch_elements = params.batch_elements?.map(file => file.toJSON());

        return this.xhr.post<SignatureProcessResponse | SignatureProcessResponse[]>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/signature`,
            JSON.stringify(
                {
                    task: this.id,
                    files,
                    ...this.requester,
                    signers,
                    batch_elements,
                    // Include optional params.
                    ...params
                }
            ),
            {
                headers: [
                    [ 'Content-Type', 'application/json;charset=UTF-8' ],
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: res => { return JSON.parse(res) }
            }
        )
        .then((data) => {
            // Keep response.
            // Be careful, server returns an array of 1 element instead
            // of the element directly on batch mode.
            if (isArray(data)) this.responses.process = data[0];
            else this.responses.process = data;

            return this;
        });

    }

    public addSigner(signer: SignerI) {
        const index = this.signers.indexOf(signer);
        if (index !== -1) throw new SignerAlreadyExistsError();

        this.signers.push(signer);
    }

    public deleteSigner(signer: SignerI) {
        const index = this.signers.indexOf(signer);
        if (index !== -1) this.signers.splice(index, 1);
    }

}
