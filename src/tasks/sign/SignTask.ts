import Task from "../Task";
import ILovePDFTool from "../../types/ILovePDFTool";
import { TaskParams } from '../Task';
import Auth from "../../auth/Auth";
import XHRInterface from "../../utils/XHRInterface";
import globals from '../../constants/globals.json';
import SignerAlreadyExistsError from "../../errors/SignerAlreadyExistsError";
import { GetSignatureStatus } from "../../ILovePDFCoreApi";
import Signer from "./receivers/Signer";
import BaseFile from "../BaseFile";

export interface SignProcessParams {
    /**
     * Emails language that will be received by signers.
     */
    language?: 'en-US' |
        'es' |
        'fr' |
        'it' |
        'ca' |
        'zh-cn' |
        'zh-tw' |
        'zh-Hans' |
        'zh-Hant' |
        'ar' |
        'ru' |
        'de' |
        'ja' |
        'pt' |
        'bg' |
        'ko' |
        'nl' |
        'el' |
        'hi' |
        'id' |
        'ms' |
        'pl' |
        'sv' |
        'th' |
        'tr' |
        'uk' |
        'vi' ;

    /**
     * If true, allow signers to sign in parallel. Otherwise, do it sequentially.
     */
    lock_order?: boolean;
    /**
     * Days until the signature request will expire.
     */
    expiration_days?: number;
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
    /**
     * Brand name that will be displayed in emails.
     * Required if `brand_logo` is set.
     */
    brand_name?: string;
    /**
     * Brand logo that will be displayed in emails.
     * Required if `brand_name` is set.
     */
    brand_logo?: string;
    /**
     * Callback url.
     */
    webhook?: string;
}

export default class SignTask extends Task {
    public type: ILovePDFTool;
    private signers: Array<Signer>;

    constructor(auth: Auth, xhr: XHRInterface , params: TaskParams = {}) {
        super(auth, xhr, params);

        this.type = 'sign';
        this.signers = [];
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
                signers,
                // Include optional params.
                ...params
            }
        );
    }

    public addReceiver(signer: Signer) {
        const index = this.signers.indexOf(signer);
        if (index !== -1) throw new SignerAlreadyExistsError();
        // Add signers to manage instance changes.
        this.signers.push(signer);
    }

    public async addFile(file: string | BaseFile): Promise< BaseFile > {
        const addedFile = await super.addFile( file );

        // Files that are not PDFs don't need to be included inside the
        // array of files.
        // For example: images for the brand logo.
        if ( !this.isPdf( addedFile ) ) this.files.pop();

        return addedFile;
    }

    private isPdf( file: BaseFile ): boolean {
        // If the extension is .pdf, is considered a PDF file.
        return /(?:\.pdf)$/i.test( file.filename );
    }
}

type ProcessReturn = GetSignatureStatus;
