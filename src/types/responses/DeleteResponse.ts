import TaskStatus from "./TaskStatus";

type DeleteResponse = {
    /**
     * Download message to know where download files.
     */
    download_filename: string;
    /**
     * Number of files as input.
     */
    file_number: string;
    /**
     * Size of input files.
     */
    filesize: number;
    /**
     * File extensions.
     */
    output_extensions: Array<string>;
    /**
     * Size of output files.
     */
    output_filesize: number;
    /**
     * Number of files as result.
     */
    output_filenumber: number;
    /**
     * Process start datetime.
     */
    process_start: string;
    /**
     * Assigned worker.
     */
    server: string;
    /**
     * Task status.
     */
    status: TaskStatus;
    /**
     * Task status message.
     */
    status_message: string;
    /**
     * Task id.
     */
    task: string;
    /**
     * Processing time.
     */
    timer: string;
    /**
     * Chosen tool.
     */
    tool: string;
};

export default DeleteResponse;