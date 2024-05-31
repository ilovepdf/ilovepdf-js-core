type UploadResponse = {
    /**
     * Name of a file inside ILovePDF servers.
     */
    server_filename: string;
    /**
     * Array of page sizes with the shape `${ width }x${ height }`
     * E.g: `612x792`
     */
    pdf_pages?: Array< string >
    /**
     * Number of pages.
     */
    pdf_page_number?: number
};

export default UploadResponse;
