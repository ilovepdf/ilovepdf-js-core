import { SignerJSON } from "../../tasks/sign/Signer";

// FIXME: Fill this type when signature API REST is well-documented.
type SignatureProcessResponse = {
    signers: Array<SignerResponse>;
};

export interface SignerResponse extends SignerJSON {
    token_signer: string;
}

export default SignatureProcessResponse;