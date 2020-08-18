import Task from "../Task";
import ILovePDFTool from "../../types/ILovePDFTool";
import { TaskParams } from '../Task';
import Auth from "../../auth/Auth";
import XHRInterface from "../../utils/XHRInterface";
import globals from '../../constants/globals.json';
import Requester from "./Requester";
import { SignerI } from "./Signer";
import SignerAlreadyExistsError from "../../errors/SignerAlreadyExistsError";

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
    // If true, displays UUID at the bottom of the signature. Otherwise, it is hidden.
    // This has only aesthetic purposes.
    uuid_visible?: boolean;
}

export default class SignTask extends Task {
    public type: ILovePDFTool;

    public requester: Requester | null;
    public readonly signers: Array<SignerI>;

    constructor(auth: Auth, xhr: XHRInterface , params: TaskParams = {}) {
        super(auth, xhr, params);

        this.type = 'sign';
        this.requester = null;
        this.signers = [];
    }

    // FIXME:Remove default values when server is well-configured.
    public async process(params: SignProcessParams = { mode: 'single', custom_int: null as unknown as number, custom_string: '' }) {
        const token = await this.auth.getToken();

        // Convert to files request format.
        const files = this.getFilesBodyFormat();

        const signers = this.signers.map(signer => (
            signer.toJSON()
        ));

        return this.xhr.post<SignResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/signature`,
            JSON.stringify(
                {
                    task: this.id,
                    files,
                    ...this.requester,
                    signers,
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
            this.responses.process = data;

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

// FIXME: Fill this type when signature API REST is well-documented.
type SignResponse = any;
