import Task from "./Task";
import globals from '../constants/globals.json';
import ProcessError from "../errors/ProcessError";
import { thereIsUndefined } from "../utils/typecheck";
import TaskStatus from "../types/responses/TaskStatus";

export default abstract class TaskBaseProcess extends Task {

    /**
     * @inheritdoc
     * @param params - Params to run the process step.
     */
    public async process(params: ProcessParams = {}): Promise<TaskBaseProcessProcess> {
        const token = await this.auth.getToken();

        // Convert to files request format.
        const files = this.getFilesBodyFormat();

        const data = await this.xhr.post<TaskBaseProcessProcess>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/process`,
            JSON.stringify(
                {
                    task: this.id,
                    tool: this.type,
                    files,
                    // Include optional params.
                    ...params
                }
            ),
            {
                headers: [
                    [ 'Content-Type', 'application/json;charset=UTF-8' ],
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: res => { return JSON.parse(res) }
            }
        );

        const { download_filename, filesize, output_extensions,
                output_filenumber, output_filesize, status, timer } = data;

        if (thereIsUndefined([ download_filename, filesize,
                                output_extensions, output_filenumber,
                                output_filesize, status, timer ])) {

            throw new ProcessError('Task cannot be processed');
        }

        return data;
    }

}

/**
 * Be careful: 'metas' property uses PascalCase due to PDF specification.
 * To know more, visit the next link:
 * http://www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/pdf_reference_1-7.pdf (page 844)
 */
export interface ProcessParams {
    // The optional Info entry in the trailer of a PDF file.
    metas?: {
        // Document title.
        Title?: string;
        // Person who created the document.
        Author?: string;
        // Subject of the document.
        Subject?: string;
        // Keywords associated with the document.
        Keywords?: string;
        // Who created the original document.
        Creator?: string;
        // Who converted to PDF from another format.
        Producer?: string;
        // Date and time of the document creation.
        CreationDate?: string;
        // Last date and time when document was modified.
        ModDate?: string;
        // Name object indicating whether the document has
        // been modified to include trapping information.
        Trapped?: string;
    },
    // Force process although some of the files to process are damaged or throw an error.
    ignore_errors?: boolean;
    // Force process although some of the files to process need a password.
    ignore_password?: boolean;
    // Output name when there is only one file as a result.
    // Inside the string, can be used the next helpers:
    // {date} - current data.
    // {n} - file number.
    // {filename} - original filename.
    // {tool} - the current processing action.
    // Example: file_{n}_{date}
    output_filename?: string;
    // If output files are more than one will be served compressed.
    // Inside the string, can be used the next helpers:
    // {date} - current data.
    // {n} - file number.
    // {filename} - original filename.
    // {app} - the current processing action.
    packaged_filename?: string;
    // If specified it is assumed all previously uploaded files for the task has been uploaded encrypted.
    file_encryption_key?: string;
    // Try to repair automatically on process fails due to PDF is corrupted.
    try_pdf_repair?: boolean;
    // Associates a number with the task in order to filter in the future on list tasks.
    custom_int?: number;
    // Associates a string with the task in order to filter in the future on list tasks.
    custom_string?: string;
    // Callback url.
    webhook?: string;
};

export type TaskBaseProcessProcess = {
    download_filename: string,
    filesize: number,
    output_filesize: number,
    output_filenumber: number,
    output_extensions: Array<string>,
    timer: string,
    status: TaskStatus,
};