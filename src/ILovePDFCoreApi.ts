import XHRInterface from "./utils/XHRInterface";
import Auth from "./auth/Auth";
import globals from './constants/globals.json';
import GetSignerResponse from "./types/responses/GetSignerResponse";
import GetSignatureTemplateResponse from "./types/responses/GetSignatureTemplateResponse";

/**
 * Updates a signer that was also the requester in a signature process.
 * @param auth - Auth system to generate the correct credentials.
 * @param xhr - XHR system to make requests.
 * @param signerToken - Signer token of the signer that has to be updated.
 * @param data - Object with values to change.
 */
const updateSigner = async (auth: Auth, xhr: XHRInterface, signerToken: string, data: UpdateSignerData): Promise<GetSignerResponse> => {
    const token = await auth.getToken();

    return xhr.put<GetSignerResponse>(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/signer/${ signerToken }`,
        data,
        {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ],
                [ 'Authorization', `Bearer ${ token }` ]
            ],
            transformResponse: res => { return JSON.parse(res) }
        });
};

export type UpdateSignerData = {
    status?: 'waiting' | 'sent' | 'viewed' | 'signed' | 'validated' | 'nonvalidated' | 'declined' | 'error';
};

/**
 * Updates a signer email in a signature process.
 * @param auth - Auth system to generate the correct credentials.
 * @param xhr - XHR system to make requests.
 * @param requesterToken - Request token of the signer that has to be updated.
 * @param email - New email.
 */
const updateSignerEmail = async (auth: Auth, xhr: XHRInterface, requesterToken: string, email: string): Promise<GetSignerResponse> => {
    const token = await auth.getToken();

    return xhr.put<GetSignerResponse>(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/signer/fix-email/${ requesterToken }`,
        {
            email
        },
        {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ],
                [ 'Authorization', `Bearer ${ token }` ]
            ],
            transformResponse: res => { return JSON.parse(res) }
        });
}

/**
 * Updates a signer phone in a signature process.
 * @param auth - Auth system to generate the correct credentials.
 * @param xhr - XHR system to make requests.
 * @param requesterToken - Request token of the signer that has to be updated.
 * @param phone - New phone.
 */
const updateSignerPhone = async (auth: Auth, xhr: XHRInterface, requesterToken: string, phone: string): Promise<GetSignerResponse> => {
    const token = await auth.getToken();

    return xhr.put<GetSignerResponse>(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/signer/fix-phone/${ requesterToken }`,
        {
            phone
        },
        {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ],
                [ 'Authorization', `Bearer ${ token }` ]
            ],
            transformResponse: res => { return JSON.parse(res) }
        });
}

/**
 * Retrieves a signature template.
 * @param auth - Auth system to generate the correct credentials.
 * @param xhr - XHR system to make requests.
 * @param taskId - Task id of the task that created the template.
 */
const getSignatureTemplate = async (auth: Auth, xhr: XHRInterface, taskId: string): Promise<GetSignatureTemplateResponse> => {
    const token = await auth.getToken();

    return xhr.get<GetSignatureTemplateResponse>(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/template/${ taskId }`,
        {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ],
                [ 'Authorization', `Bearer ${ token }` ]
            ],
            transformResponse: res => { return JSON.parse(res) }
        });
}

export default {
    updateSigner,
    updateSignerEmail,
    updateSignerPhone,
    getSignatureTemplate
}