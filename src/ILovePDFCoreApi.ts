import XHRInterface from "./utils/XHRInterface";
import Auth from "./auth/Auth";
import globals from './constants/globals.json';
import SignTask from "./tasks/sign/SignTask";
import SignatureProcessResponse from "./types/responses/SignatureProcessResponse";
import Signer from "./tasks/sign/Signer";
import Requester from "./tasks/sign/Requester";
import BaseFile from "./tasks/BaseFile";
import GetSignatureResponse from "./types/responses/GetSignatureResponse";
import GetSignatureListResponse from "./types/responses/GetSignatureListResponse";
import DownloadResponse from "./types/responses/DownloadResponse";
import DownloadError from "./errors/DownloadError";

/**
 * Retrieves a signature task.
 * @param auth - Auth system to generate the correct credentials.
 * @param xhr - XHR system to make requests.
 * @param signatureToken - Signature token.
 */
const getSignature = async (auth: Auth, xhr: XHRInterface, signatureToken: string): Promise<SignTask> => {
    const token = await auth.getToken();

    const response = await xhr.get<GetSignatureResponse>(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/requesterview/${ signatureToken }`,
        {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ],
                [ 'Authorization', `Bearer ${ token }` ]
            ],
            transformResponse: res => { return JSON.parse(res) }
        }
    );

    const { email, name, custom_int, custom_string, task } = response;

    const requester: Requester = {
        email,
        name,
        custom_int,
        custom_string
    }

    const signers = response.signers.map(signerResponse => {
        const signer = Signer.from(signerResponse);
        return signer;
    });

    const files = response.files.map(file => {
        return new BaseFile('', file.server_filename, file.filename);
    });


    const signTask = new SignTask(auth, xhr, {
        files,
        id: task,
        requester,
        signers,
        token: signatureToken,
    })

    return signTask;
};

const getSignatureList = async (auth: Auth, xhr: XHRInterface,
                                page: number = 0, pageLimit: number = 20): Promise<Array<SignTask>> => {

    const token = await auth.getToken();

    const response = await xhr.get<GetSignatureListResponse>(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/list?page=${ page }&per-page=${ pageLimit }`,
        {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ],
                [ 'Authorization', `Bearer ${ token }` ]
            ],
            transformResponse: res => { return JSON.parse(res) }
        }
    );

    const signatureList: Array<SignTask> = [];

    for( let i = 0; i < response.length; i++ ) {
        const signature = response[i];
        const signTask = await createExistingSignTask(auth, xhr, signature);

        signatureList.push(signTask);
    }

    return signatureList;
};

async function createExistingSignTask( auth: Auth, xhr: XHRInterface, response: GetSignatureResponse ): Promise<SignTask> {
    const { email, name, custom_int, custom_string, task } = response;

    const requester: Requester = {
        email,
        name,
        custom_int,
        custom_string
    }

    const signers = response.signers.map(signerResponse => {
        const signer = Signer.from(signerResponse);
        return signer;
    });

    const files = response.files.map(file => {
        return new BaseFile('', file.server_filename, file.filename);
    });

    const signTask = new SignTask(auth, xhr, {
        files,
        id: task,
        requester,
        signers
    })

    return signTask;
}

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
    getSignature,
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