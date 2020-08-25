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
    user_id: number;
    custom_string: string;
    custom_int: number;
    id: number;
};

export default GetSignatureTemplateResponse;