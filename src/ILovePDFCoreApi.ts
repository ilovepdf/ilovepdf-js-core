import XHRInterface from "./utils/XHRInterface";
import Auth from "./auth/Auth";
import globals from './constants/globals.json';
import DownloadError from "./errors/DownloadError";
import SignatureStatus from "./types/responses/SignatureStatus";
import ServerFile from "./types/ServerFile";
import StartResponse from "./types/responses/StartResponse";
import { URLSearchParams } from "url";

/**
 * Returns the signature identified by `signatureToken`.
 * @param auth Auth system to generate the correct credentials.
 * @param xhr XHR system to make requests.
 * @param signatureToken token_requester property from a created signature.
 * @returns Signature.
 */
const getSignatureStatus = async (auth: Auth, xhr: XHRInterface, signatureToken: string): Promise<GetSignatureStatus> => {
    const token = await auth.getToken();

    const response = await xhr.get<GetSignatureStatus>(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/requesterview/${ signatureToken }`,
        {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ],
                [ 'Authorization', `Bearer ${ token }` ]
            ],
            transformResponse: res => { return JSON.parse(res) }
        }
    );

    return response;
};

interface SignatureListFilters {
    text?: string;
    status?: SignatureStatus;
    sort_field?: 'created' | 'filename';
    sort_direction?: 'asc' | 'desc';
    created_more_than?: string;
    created_less_than?: string;
}

/**
 * Only adds the query param if value is not undefined.
 */
const addOptionalQueryParam = (searchParams: URLSearchParams, name: string, value: string | undefined) => {
    if (typeof value !== 'undefined') {
        searchParams.set(name, value);
    }
}

/**
 * Returns a list of the created signatures.
 * A pagination system is used to limit the response length.
 * @param auth Auth system to generate the correct credentials.
 * @param xhr XHR system to make requests.
 * @param page
 * @param pageLimit Limit of objects per page.
 * @param filters.text If specified, searches only signatures that contain this text in the filename, signer's name, or signer's email.
 * @param filters.status If specified, searches only signatures that have this status.
 * @param filters.sort_field What field to sort elements by. "created" sorts by creation date, "filename" sorts by filename alphabetically. Default = "created"
 * @param filters.sort_direction Whether to sort elements in ascending or descending order. Default = "asc"
 * @param filters.created_more_than If specified, searches only signatures created after this date. Format: yyyy-mm-dd
 * @param filters.created_less_than If specified, searches only signatures created before this date. Format: yyyy-mm-dd
 * @returns List of signatures.
 */
const getSignatureList = async (auth: Auth, xhr: XHRInterface,
                                page: number = 0, pageLimit: number = 20, filters: SignatureListFilters = {}): Promise<Array<GetSignatureStatus>> => {

    const token = await auth.getToken();

    const server = await getSignServer( xhr, token );

    const searchParams = new URLSearchParams()

    searchParams.set('page', page.toString())
    searchParams.set('per-page', pageLimit.toString())
    addOptionalQueryParam(searchParams, 'text', filters.text)
    addOptionalQueryParam(searchParams, 'status', filters.status)
    addOptionalQueryParam(searchParams, 'sort_field', filters.sort_field)
    addOptionalQueryParam(searchParams, 'sort_direction', filters.sort_direction)
    addOptionalQueryParam(searchParams, 'created_more_than', filters.created_more_than)
    addOptionalQueryParam(searchParams, 'created_less_than', filters.created_less_than)

    const queryString = searchParams.toString();

    const response = await xhr.get<Array<GetSignatureStatus>>(
        `${ globals.API_URL_PROTOCOL }://${ server }/${ globals.API_VERSION }/signature/list?${queryString}`,
        {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ],
                [ 'Authorization', `Bearer ${ token }` ]
            ],
            transformResponse: res => { return JSON.parse(res) }
        }
    );

    return response;
};

/**
 * Voids a non-completed signature.
 * @param auth Auth system to generate the correct credentials.
 * @param xhr XHR system to make requests.
 * @param signatureToken token_requester property from a created signature.
 */
const voidSignature = async (auth: Auth, xhr: XHRInterface,
                             signatureToken: string): Promise< void > => {

    const token = await auth.getToken();

    const server = await getSignServer( xhr, token );

    await xhr.put(
        `${ globals.API_URL_PROTOCOL }://${ server }/${ globals.API_VERSION }/signature/void/${ signatureToken }`,
        undefined,
        {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ],
                [ 'Authorization', `Bearer ${ token }` ]
            ],
        }
    );
};

/**
 * Increases the expiration days limit from a signature.
 * @param auth Auth system to generate the correct credentials.
 * @param xhr XHR system to make requests.
 * @param signatureToken token_requester property from a created signature.
 * @param daysAmount Days to increase.
 */
const increaseSignatureExpirationDays = async (auth: Auth, xhr: XHRInterface,
                                               signatureToken: string, daysAmount: number): Promise< void > => {

    const token = await auth.getToken();

    const server = await getSignServer( xhr, token );

    await xhr.put(
        `${ globals.API_URL_PROTOCOL }://${ server }/${ globals.API_VERSION }/signature/increase-expiration-days/${ signatureToken }`,
        JSON.stringify({
            days: daysAmount,
        })
        ,
        {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ],
                [ 'Authorization', `Bearer ${ token }` ]
            ],
        }
    );
};

/**
 * Sends reminders to all the receivers to sign, validate or witness a document.
 * @param auth Auth system to generate the correct credentials.
 * @param xhr XHR system to make requests.
 * @param signatureToken token_requester property from a created signature.
 */
const sendReminders = async (auth: Auth, xhr: XHRInterface,
                             signatureToken: string): Promise< void > => {

    const token = await auth.getToken();

    const server = await getSignServer( xhr, token );

    await xhr.post(
        `${ globals.API_URL_PROTOCOL }://${ server }/${ globals.API_VERSION }/signature/sendReminder/${ signatureToken }`,
        undefined,
        {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ],
                [ 'Authorization', `Bearer ${ token }` ]
            ],
        }
    );
};

/**
 * Returns a PDF or ZIP file with the original files, uploaded
 * at the beginning of the signature creation.
 * @param auth Auth system to generate the correct credentials.
 * @param xhr XHR system to make requests.
 * @param signatureToken token_requester property from a created signature.
 * @returns PDF or ZIP file with the original files.
 */
const downloadOriginalFiles = async (auth: Auth, xhr: XHRInterface,
                                     signatureToken: string): Promise<Uint8Array> => {

    const token = await auth.getToken();

    const server = await getSignServer( xhr, token );

    const data = await xhr.get<Uint8Array>(
        `${ globals.API_URL_PROTOCOL }://${ server }/${ globals.API_VERSION }/signature/${ signatureToken }/download-original`, {
        headers: [
            [ 'Authorization', `Bearer ${ token }` ]
        ],
        binary: true
    })

    if (!data) throw new DownloadError('File cannot be downloaded');

    return data;
};

/**
 * Returns a PDF or ZIP file with the signed files.
 * @param auth Auth system to generate the correct credentials.
 * @param xhr XHR system to make requests.
 * @param signatureToken token_requester property from a created signature.
 * @returns PDF or ZIP file with the signed files.
 */
const downloadSignedFiles = async (auth: Auth, xhr: XHRInterface,
                                   signatureToken: string): Promise<Uint8Array> => {

    const token = await auth.getToken();

    const server = await getSignServer( xhr, token );

    const data = await xhr.get<Uint8Array>(
        `${ globals.API_URL_PROTOCOL }://${ server }/${ globals.API_VERSION }/signature/${ signatureToken }/download-signed`, {
        headers: [
            [ 'Authorization', `Bearer ${ token }` ]
        ],
        binary: true
    })

    if (!data) throw new DownloadError('File cannot be downloaded');

    return data;
};

/**
 * Returns a PDF or ZIP file with the audit files that inform about
 * files legitimity.
 * @param auth Auth system to generate the correct credentials.
 * @param xhr XHR system to make requests.
 * @param signatureToken token_requester property from a created signature.
 * @returns PDF or ZIP file with the audit files.
 */
const downloadAuditFiles = async (auth: Auth, xhr: XHRInterface,
                                  signatureToken: string): Promise<Uint8Array> => {

    const token = await auth.getToken();

    const server = await getSignServer( xhr, token );

    const data = await xhr.get<Uint8Array>(
        `${ globals.API_URL_PROTOCOL }://${ server }/${ globals.API_VERSION }/signature/${ signatureToken }/download-audit`, {
        headers: [
            [ 'Authorization', `Bearer ${ token }` ]
        ],
        binary: true
    })

    if (!data) throw new DownloadError('File cannot be downloaded');

    return data;
};

async function getSignServer( xhr: XHRInterface, token: string ): Promise< string > {
    const { server } = await xhr.get<StartResponse>(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/start/sign`, {
        headers: [
            [ 'Content-Type', 'application/json;charset=UTF-8' ],
            [ 'Authorization', `Bearer ${ token }` ]
        ],
        transformResponse: res => { return JSON.parse(res) }
    });

    return server;
}

/**
 * Returns a receiver information related to a specific sign process.
 * @param auth Auth system to generate the correct credentials.
 * @param xhr XHR system to make requests.
 * @param receiverTokenRequester token_requester from a receiver.
 * @returns Receiver information.
 */
const getReceiverInfo = async (auth: Auth, xhr: XHRInterface,
                               receiverTokenRequester: string): Promise<GetReceiverInfoResponse> => {

    const token = await auth.getToken();

    const server = await getSignServer( xhr, token );

    const data = await xhr.get<GetReceiverInfoResponse>(
        `${ globals.API_URL_PROTOCOL }://${ server }/${ globals.API_VERSION }/signature/receiver/info/${ receiverTokenRequester }`, {
        headers: [
            [ 'Authorization', `Bearer ${ token }` ]
        ],
        transformResponse: res => { return JSON.parse(res) }
    })

    if (!data) throw new DownloadError('File cannot be downloaded');

    return data;
};

/**
 * Fixes a receiver's email.
 * @param auth Auth system to generate the correct credentials.
 * @param xhr XHR system to make requests.
 * @param receiverTokenRequester token_requester from a receiver.
 * @param email New email.
 */
const fixReceiverEmail = async (auth: Auth, xhr: XHRInterface,
                                receiverTokenRequester: string, email: string): Promise< void > => {

    const token = await auth.getToken();

    const server = await getSignServer( xhr, token );

    await xhr.put(
        `${ globals.API_URL_PROTOCOL }://${ server }/${ globals.API_VERSION }/signature/signer/fix-email/${ receiverTokenRequester }`,
        JSON.stringify({
            email,
        }),
        {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ],
                [ 'Authorization', `Bearer ${ token }` ]
            ],
        }
    );
};

/**
 * Fixes a receiver's phone.
 * @param auth Auth system to generate the correct credentials.
 * @param xhr XHR system to make requests.
 * @param receiverTokenRequester token_requester from a receiver.
 * @param phone New phone.
 */
const fixReceiverPhone = async (auth: Auth, xhr: XHRInterface,
                                receiverTokenRequester: string, phone: string): Promise< void > => {

    const token = await auth.getToken();

    const server = await getSignServer( xhr, token );

    await xhr.put(
        `${ globals.API_URL_PROTOCOL }://${ server }/${ globals.API_VERSION }/signature/signer/fix-phone/${ receiverTokenRequester }`,
        JSON.stringify({
            phone,
        }),
        {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ],
                [ 'Authorization', `Bearer ${ token }` ]
            ],
        }
    );
};

export default {
    getSignatureStatus,
    getSignatureList,
    voidSignature,
    increaseSignatureExpirationDays,
    sendReminders,
    downloadOriginalFiles,
    downloadSignedFiles,
    downloadAuditFiles,
    getReceiverInfo,
    fixReceiverEmail,
    fixReceiverPhone,
}

export type GetSignatureStatus = {
    brand_name: string | null,
    completed_on: string | null,
    created: string,
    email: string,
    expires: string,
    language: 'en-US' |
              'es' |
              'fr' |
              'it' |
              'ca' |
              'zh-cn' |
              'zh-tw' |
              'zh-Hant' |
              'zh-Hans' |
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
              'vi',
    message_signer: string,
    mode: 'multiple',
    name: string,
    notes: string | null,
    signer_reminder_days_cycle: number,
    subject_cc: string | null,
    subject_signer: string | null,
    token_requester: string,
    uuid: string,
    expired: boolean,
    signers: Array<GetReceiverInfoResponse>,
    expiring: boolean,
    verify_enabled: boolean,
    files: Array< ServerFile >,
    certified: boolean,
    signer_reminders: boolean,
    status: SignatureStatus,
    uuid_visible: boolean,
    lock_order: boolean,
};

export type GetReceiverInfoResponse = {
    uuid: string,
    name: string,
    email: string,
    type: 'signer' | 'witness' | 'validator',
    token_requester: string,
    status: 'waiting' | 'sent' | 'viewed' |
            'signed' | 'validated' | 'nonvalidated' |
            'declined' | 'error',
    access_code: boolean,
    force_signature_type: 'all' | 'text' | 'sign' | 'image',
    notes: string | null,
    fix_email_needed: boolean,
    fix_phone_needed: boolean,
};
