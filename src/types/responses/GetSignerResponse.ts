import { SignatureFileJSON } from "../../tasks/sign/SignatureFile";
import ServerFile from "../ServerFile";
import SignatureStatus from "./SignatureStatus";

type GetSignerResponse = {
    /**
     * DB primary key.
     */
    id: number;
    /**
     * Signature id.
     */
    signature_id: number;
    /**
     * UUID
     */
    uuid: string;
    /**
     * User id.
     */
    user_id: number;
    /**
     * Custom number to filter in the future.
     */
    custom_int: number;
    /**
     * Custom string to filter in the future.
     */
    custom_string: string;
    /**
     * Signer name.
     */
    name: string;
    /**
     * Signer email.
     */
    email: string;
    /**
     * Signer phone.
     */
    phone: string;
    /**
     * Requester message to ask for a phone change.
     */
    phone_reviewed: string;
    /**
     * Phone retries sent.
     */
    phone_retries_left: number;
    /**
     * Type of Signer:
     * signer: Person who has to sign the document.
     * validator: Person who accepts or rejects the document.
     * witness: Person who can access and see the document.
     */
    type: 'signer' | 'validator' | 'witness';
    /**
     * Signer token.
     */
    token_signer?: string;
    /**
     * Requester token.
     */
    token_requester: string;
    /**
     * Shared token.
     */
    token_shared: string;
    /**
     * Signature status.
     */
    status: SignatureStatus;
    /**
     * Email status. If it has a number < 10, it has an error.
     */
    email_status: number;
    /**
     * Phone status. If it has a number < 10, it has an error.
     */
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
    /**
     * Signature type can be a text, a drawn signature or image.
     */
    signature_type: 'text' | 'sign' | 'image';
    /**
     * Initials type can be a text, a drawn signature or image.
     */
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
    /**
     * Access code to access the document to sign.
     */
    access_code: string;
    /**
     * If true, enable sms validation.
     */
    phone_access_code: boolean;
    /**
     * Force to use one signature type.
     */
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
    /**
     * Files associated to the signer.
     */
    files: Array<SignatureFileJSON>;
    /**
     * Task id.
     */
    task: string;
    /**
     * Audit object to maintain the document signature
     * information.
     */
    audit: Array<Audit>;
    /**
     * Signature files associated to the signer.
     */
    signatureFiles: Array<ServerFile>;
};

type Audit = {
    /**
     * Audit id.
     */
    id: number;
    /**
     * Associated user id.
     */
    user_id: number;
    /**
     * Associated signer id.
     */
    signer_id: number;
    /**
     * Associated advisor id.
     */
    advisor_id: number;
    /**
     * Associated log id.
     */
    log_id: number;
    /**
     * Associated signature id.
     */
    signature_id: number;
    /**
     * Performed action.
     */
    action: string;
    /**
     * Action datetime.
     */
    action_datetime: string;
    /**
     * Ip where document was signed.
     */
    ip: string;
    /**
     * Used browser to sign.
     */
    browser: string;
};

export default GetSignerResponse;