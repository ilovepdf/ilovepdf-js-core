import GetSignerResponse from "./GetSignerResponse";
import SignatureStatus from "./SignatureStatus";

type SignatureProcessResponse = {
    status: SignatureStatus;
    signers: Array<GetSignerResponse>;
};

export default SignatureProcessResponse;