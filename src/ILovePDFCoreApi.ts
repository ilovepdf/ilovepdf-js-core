import XHRInterface from "./utils/XHRInterface";
import Auth from "./auth/Auth";
import globals from './constants/globals.json';
import GetSignerResponse from "./types/responses/GetSignerResponse";

/**
 * Updates a signer that was processed and it is inside ILovePDF servers.
 * @param auth - Auth system to generate the correct credentials.
 * @param xhr - XHR system to make requests.
 * @param signerToken - Token of the signer that has to be updated.
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
    name?: string;
    initials?: unknown;
    status?: string;
    ip_signed?: unknown;
    custom_int?: number;
    custom_string?: string;
    browser_signed?: unknown;
    notes?: unknown;
    access_code?: string;
    phone_access_code?: string;
    validated_phone?: unknown;
    font?: unknown;
    color?: unknown;
    signature_type?: unknown;
    initials_type?: unknown;
    signature_image_server_filename?: unknown;
    initials_image_server_filename?: unknown;
};

export default {
    updateSigner
}