type StartResponse = {
    /**
     * Assignated worker server.
     */
    server: string;
    /**
     * Created task id.
     */
    task: string;
    /**
     * Remaining files counting the "free files",
     * subscription files and package files.
     */
    remaining_files: number;
};

export default StartResponse;
