type GetSignatureTemplateResponse = {
    /**
     * Signature object stringified.
     */
    elements: string;
    /**
     * Template name.
     */
    name: string;
    /**
     * Timestamp of when it was saved.
     */
    saved_on: string;
    /**
     * Template id. It's equals to its task id.
     */
    template: string;
    /**
     * User id who created the signature.
     */
    user_id: number;
    /**
     * Custom string to filter in the future.
     */
    custom_string: string;
    /**
     * Custom number to filter in the future.
     */
    custom_int: number;
    /**
     * DB primary key.
     */
    id: number;
};

export default GetSignatureTemplateResponse;