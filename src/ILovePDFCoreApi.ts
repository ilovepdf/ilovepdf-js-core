import XHRInterface from "./utils/XHRInterface";
import Auth from "./auth/Auth";
import globals from './constants/globals.json';
import DownloadResponse from "./types/responses/DownloadResponse";
import DownloadError from "./errors/DownloadError";
import SignatureStatus from "./types/responses/SignatureStatus";
import ServerFile from "./types/ServerFile";

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

/**
 * Returns a list of the created signatures.
 * A pagination system is used to limit the response length.
 * @param auth Auth system to generate the correct credentials.
 * @param xhr XHR system to make requests.
 * @param page
 * @param pageLimit Limit of objects per page.
 * @returns List of signatures.
 */
const getSignatureList = async (auth: Auth, xhr: XHRInterface,
                                page: number = 0, pageLimit: number = 20): Promise<Array<GetSignatureStatus>> => {

    const token = await auth.getToken();

    const response = await xhr.get<Array<GetSignatureStatus>>(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/list?page=${ page }&per-page=${ pageLimit }`,
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

    await xhr.put(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/void/${ signatureToken }`,
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

    await xhr.put(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/increase-expiration-days/${ signatureToken }`,
        {
            days: daysAmount,
        },
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

    await xhr.post(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/sendReminder/${ signatureToken }`,
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
                                     signatureToken: string): Promise<DownloadResponse> => {

    const token = await auth.getToken();

    const data = await xhr.get<DownloadResponse>(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/${ signatureToken }/download-original`, {
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
                                   signatureToken: string): Promise<DownloadResponse> => {

    const token = await auth.getToken();

    const data = await xhr.get<DownloadResponse>(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/${ signatureToken }/download-signed`, {
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
                                  signatureToken: string): Promise<DownloadResponse> => {

    const token = await auth.getToken();

    const data = await xhr.get<DownloadResponse>(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/${ signatureToken }/download-audit`, {
        headers: [
            [ 'Authorization', `Bearer ${ token }` ]
        ],
        binary: true
    })

    if (!data) throw new DownloadError('File cannot be downloaded');

    return data;
};

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

    const data = await xhr.get<GetReceiverInfoResponse>(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/receiver/info/${ receiverTokenRequester }`, {
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

    await xhr.put(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/signer/fix-email/${ receiverTokenRequester }`,
        {
            email,
        },
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

    await xhr.put(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/signer/fix-phone/${ receiverTokenRequester }`,
        {
            phone,
        },
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

type GetReceiverInfoResponse = {
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