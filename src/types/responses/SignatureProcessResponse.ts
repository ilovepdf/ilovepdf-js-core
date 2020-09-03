import GetSignerResponse from "./GetSignerResponse";
import SignatureStatus from "./SignatureStatus";
import ServerFile from "../ServerFile";

type SignatureProcessResponse = {
    /**
     * Task id.
     */
    task: string;
    /**
     * Requester name.
     */
    name: string;
    /**
     * Requester email.
     */
    email: string;
    /**
     * Signature status.
     */
    status: SignatureStatus;
    /**
     * Signature signers
     */
    signers: Array<GetSignerResponse>;
    /**
     * Custom number to filter in the future.
     */
    custom_int: number;
    /**
     * Custom string to filter in the future.
     */
    custom_string: string;
    /**
     * Signature files.
     */
    files: Array<ServerFile>;
};

export default SignatureProcessResponse;