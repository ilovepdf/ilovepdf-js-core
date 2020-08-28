import { SignatureFileJSON } from "../../tasks/sign/SignatureFile";
import ServerFile from "../ServerFile";
import SignerStatus from "./SignerStatus";

type GetSignerResponse = {
    id: number;
    signature_id: number;
    uuid: string;
    user_id: number;
    custom_int: number;
    custom_string: string;
    name: string;
    email: string;
    phone: string;
    /**
     * Requester message to ask for a phone change.
     */
    phone_reviewed: string;
    phone_retries_left: number;
    type: 'signer' | 'validator' | 'witness';
    token_signer?: string;
    token_requester: string;
    token_shared: string;
    /**
     * Signature status.
     */
    status: SignerStatus;
    email_status: number;
    phone_status: number;
    /**
     * Stringified Date type.
     */
    created: string;
    /**
     * Signature font.
     */
    font: 'Arial-Unicode-MS' | 'Shadows-Into-Light' | 'La-Belle-Aurore' | 'Alex-Brush-Regular' | 'Allura-Regular' | 'Handlee-Regular' | 'Kristi-Regular' | 'Marck-Script' | 'Reenie-Beanie' | 'Satisfy-Regular' | 'SmoothStone-Regular' | 'TheSecret-Regular' | 'Zeyada';
    /**
     * Signature color.
     */
    color: string;
    /**
     * Initials text.
     */
    initials: string;
    signature_type: 'text' | 'sign' | 'image';
    initials_type: 'text' | 'sign' | 'image';
    /**
     * @ignore
     * Server control data.
     */
    ip_signed: string;
    /**
     * @ignore
     * Server control data.
     */
    browser_signed: string;
    access_code: string;
    /**
     * If true, enable sms validation.
     */
    phone_access_code: boolean;
    force_signature_type: 'sign' | 'text' | 'image' | 'all';
    /**
     * Custom message for signer from requester.
     */
    notes: string;
    /**
     * Image uploaded for signer and his signature.
     */
    signature_image_server_filename: string;
    /**
     * Image uploaded for signer and his initials.
     */
    initials_image_server_filename: string;
    /**
     * Revision current status.
     */
    revision_doc: string;
    /**
     * Color of the signer "avatar".
     */
    letter_color: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';
    /**
     * @ignore
     * Server control data.
     */
    backup_ilovepdf: boolean;
    /**
     * @ignore
     * Server control data.
     */
    backup_s3: boolean;
    files: Array<SignatureFileJSON>;
    task: string;
    audit: Array<Audit>;
    signatureFiles: Array<ServerFile>;
};

type Audit = {
    id: number;
    user_id: number;
    signer_id: number;
    advisor_id: number;
    log_id: number;
    signature_id: number;
    action: string;
    action_datetime: string;
    ip: string;
    browser: string;
};

export default GetSignerResponse;