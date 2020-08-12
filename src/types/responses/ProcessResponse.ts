import FileStatus from "./FileStatus";
import TaskStatus from "./TaskStatus";

type ProcessResponse = {
    download_filename: string;
    filesize: number;
    output_filesize: number;
    output_filenumber: number;
    output_extensions: Array<string>;
    timer: string;
    status: TaskStatus;
    validations?: Array<{
        server_filename: string;
        status: FileStatus;
    }>;
};

export default ProcessResponse;