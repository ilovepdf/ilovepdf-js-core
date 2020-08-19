import { SignerJSON } from "../../tasks/sign/Signer";

// FIXME: Fill this type when signature API REST is well-documented.
type SignatureProcessResponse = {
    signers: Array<SignerJSON>;
};

export default SignatureProcessResponse;