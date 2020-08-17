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

    public async process(params: SignProcessParams = {}) {
        const token = await this.auth.getToken();

        const signers = this.signers.map(signer => (
            signer.toJSON()
        ));

        return this.xhr.post<SignResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/signature`,
            JSON.stringify(
                {
                    task: this.id,
                    files: this.files,
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
            console.log(data);

            return this;
        })
        .catch(e => {
            throw e;
        });

    }

    public addSigner(signer: SignerI) {
        const index = this.signers.indexOf(signer);
        if (index !== -1) throw new SignerAlreadyExistsError();
    }

    public deleteSigner(signer: SignerI) {
        const index = this.signers.indexOf(signer);
        if (index !== -1) this.signers.splice(index, 1);
    }

}

type SignResponse = {


};
