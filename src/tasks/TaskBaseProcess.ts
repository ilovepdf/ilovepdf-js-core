import Task, { TaskParams } from "./Task";
import ProcessResponse from "../types/responses/ProcessResponse";
import TaskI, { ResponsesI } from "./TaskI";
import globals from '../constants/globals.json';
import ProcessError from "../errors/ProcessError";
import { thereIsUndefined } from "../utils/typecheck";
import XHRInterface from "../utils/XHRInterface";
import Auth from "../auth/Auth";
import TaskStatus from "../types/responses/TaskStatus";
import GetTaskResponse from "../types/responses/GetTaskResponse";

interface Responses extends ResponsesI {
    process: ProcessResponse | null;
}

export default abstract class TaskBaseProcess extends Task {
    public readonly responses: Responses;

    constructor(auth: Auth, xhr: XHRInterface, params: TaskParams = {}) {
        super(auth, xhr, params);

        this.responses = {
            start: null,
            addFile: null,
            deleteFile: null,
            process: null,
            download: null,
            delete: null,
            connect: null
        }
    }

    /**
     * @inheritdoc
     */
    public async getStatus(): Promise<TaskStatus> {
        const token = await this.auth.getToken();

        const response = await this.xhr.get<GetTaskResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/task/${ this.id }`,
            {
                headers: [
                    [ 'Content-Type', 'application/json;charset=UTF-8' ],
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: res => { return JSON.parse(res) }
            }
        )

        return response.status;
    }

    /**
     * @inheritdoc
     * @param params - Params to run the process step.
     */
    public async process(params: ProcessParams = {}): Promise<TaskI> {
        const token = await this.auth.getToken();

        // Convert to files request format.
        const files = this.getFilesBodyFormat();

        return this.xhr.post<ProcessResponse>(
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
        )
        .then((data) => {
            const { download_filename, filesize, output_extensions,
                    output_filenumber, output_filesize, status, timer } = data;

            if (thereIsUndefined([ download_filename, filesize,
                                   output_extensions, output_filenumber,
                                   output_filesize, status, timer ])) {

                throw new ProcessError('Task cannot be processed');
            }

            // Keep response.
            this.responses.process = data;

            return this;
        })
        .catch(e => {
            throw e;
        });
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