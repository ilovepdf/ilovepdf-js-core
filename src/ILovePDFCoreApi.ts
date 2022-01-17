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

    xhr.put(
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

    xhr.put(
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

export default {
    getSignature,
    getSignatureList,
    voidSignature,
    increaseSignatureExpirationDays,
}