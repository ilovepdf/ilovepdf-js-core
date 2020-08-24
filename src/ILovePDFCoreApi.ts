import XHRInterface from "./utils/XHRInterface";
import Auth from "./auth/Auth";
import globals from './constants/globals.json';
import GetSignerResponse from "./types/responses/GetSignerResponse";
import { SignatureFileJSON } from "../dist/tasks/sign/SignatureFile";

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
    /**
     * Initials text.
     */
    initials?: string;
    /**
     * Signature status.
     */
    status?: 'waiting' | 'sent' | 'viewed' | 'signed' | 'validated' | 'nonvalidated' | 'declined' | 'error';
    custom_int?: number;
    custom_string?: string;
    /**
     * Custom message for signer from requester.
     */
    notes?: string;
    access_code?: string;
    /**
     * If true, enable sms validation.
     */
    phone_access_code?: boolean;
    validated_phone?: boolean;
    /**
     * Signature font.
     */
    font?: 'Arial-Unicode-MS' | 'Shadows-Into-Light' | 'La-Belle-Aurore' | 'Alex-Brush-Regular' | 'Allura-Regular' | 'Handlee-Regular' | 'Kristi-Regular' | 'Marck-Script' | 'Reenie-Beanie' | 'Satisfy-Regular' | 'SmoothStone-Regular' | 'TheSecret-Regular' | 'Zeyada';
    /**
     * Signature color.
     */
    color?: string;
    signature_type?: 'text' | 'sign' | 'image';
    initials_type?: 'text' | 'sign' | 'image';
    /**
     * Image uploaded for signer and his signature.
     */
    signature_image_server_filename?: string;
    /**
     * Image uploaded for signer and his initials.
     */
    initials_image_server_filename?: string;
    files?: Array<SignatureFileJSON>;
};

export default {
    updateSigner
}