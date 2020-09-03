import FileStatus from "./FileStatus";
import TaskStatus from "./TaskStatus";

type ProcessResponse = {
    /**
     * Download filename.
     */
    download_filename: string;
    /**
     * Input file size.
     */
    filesize: number;
    /**
     * Output file size.
     */
    output_filesize: number;
    /**
     * Output file number.
     */
    output_filenumber: number;
    /**
     * Output extensions.
     */
    output_extensions: Array<string>;
    /**
     * Processing time.
     */
    timer: string;
    /**
     * Task status.
     */
    status: TaskStatus;
    /**
     * Property only present on use ValidaPdfaTask.
     */
    validations?: Array<{
        /**
         * PDF filename inside the server where it is associated.
         */
        server_filename: string;
        /**
         * File status.
         */
        status: FileStatus;
    }>;
};

export default ProcessResponse;