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
    language?: string;
    lock_order?: boolean;
    expiration_date?: number;
    certified?: boolean;
    custom_int?: number;
    custom_string?: string;
    mode?: 'single' | 'multiple' | 'batch';
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
