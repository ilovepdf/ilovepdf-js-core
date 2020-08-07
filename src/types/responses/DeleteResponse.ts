type DeleteResponse = {
    download_filename: string;
    file_number: string;
    filesize: number;
    output_extensions: Array<string>;
    output_filesize: number;
    output_filenumber: number;
    process_start: string;
    server: string;
    status: string;
    status_message: string;
    task: string;
    timer: string;
    tool: string;
};

export default DeleteResponse;