type ConnectResponse = {
    /**
     * Task id.
     */
    task: string;
    /**
     * Key-value representing server_filename-filename.
     */
    files: {
        [ server_filename: string ]: string
    }
};

export default ConnectResponse;