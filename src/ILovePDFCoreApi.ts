import XHRInterface from "./utils/XHRInterface";
import Auth from "./auth/Auth";
import globals from './constants/globals.json';
import GetSignatureTemplateResponse from "./types/responses/GetSignatureTemplateResponse";
import SignTask from "./tasks/sign/SignTask";
import SignatureProcessResponse from "./types/responses/SignatureProcessResponse";
import Signer from "./tasks/sign/Signer";
import Requester from "./tasks/sign/Requester";
import BaseFile from "./tasks/BaseFile";

/**
 * Retrieves a signature template.
 * @param auth - Auth system to generate the correct credentials.
 * @param xhr - XHR system to make requests.
 * @param templateTaskId - Task id of the task that created the template.
 */
const getSignatureTemplate = async (auth: Auth, xhr: XHRInterface, templateTaskId: string): Promise<GetSignatureTemplateResponse> => {
    const token = await auth.getToken();

    return xhr.get<GetSignatureTemplateResponse>(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/template/${ templateTaskId }`,
        {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ],
                [ 'Authorization', `Bearer ${ token }` ]
            ],
            transformResponse: res => { return JSON.parse(res) }
        });
}

/**
 * Retrieves a signature task.
 * @param auth - Auth system to generate the correct credentials.
 * @param xhr - XHR system to make requests.
 * @param templateTaskId - Task id of the task that created the template.
 */
const getSignature = async (auth: Auth, xhr: XHRInterface, templateTaskId: string): Promise<SignTask> => {
    const token = await auth.getToken();

    const response = await xhr.get<SignatureProcessResponse>(
        `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/signature/${ templateTaskId }`,
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
        server: '',
        signers
    })

    return signTask;
}

export default {
    getSignatureTemplate
}