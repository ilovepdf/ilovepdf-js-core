import { SignerJSON } from "../../tasks/sign/Signer";

type SignatureProcessResponse = {
    signers: Array<SignerResponse>;
};

export interface SignerResponse extends SignerJSON {
    token_signer: string;
}

export default SignatureProcessResponse;