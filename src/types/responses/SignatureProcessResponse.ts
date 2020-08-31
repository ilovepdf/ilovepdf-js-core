import GetSignerResponse from "./GetSignerResponse";
import SignatureStatus from "./SignatureStatus";
import ServerFile from "../ServerFile";

type SignatureProcessResponse = {
    task: string;
    name: string;
    email: string;
    status: SignatureStatus;
    signers: Array<GetSignerResponse>;
    custom_int: number;
    custom_string: string;
    files: Array<ServerFile>;
};

export default SignatureProcessResponse;