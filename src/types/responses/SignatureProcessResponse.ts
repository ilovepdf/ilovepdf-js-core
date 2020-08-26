import { SignerJSON } from "../../tasks/sign/Signer";

type SignatureProcessResponse = {
    signers: Array<SignerResponse>;
};

export interface SignerResponse extends SignerJSON {
    token_signer?: string;
    token_requester: string;
    token_shared: string;
}

export default SignatureProcessResponse;