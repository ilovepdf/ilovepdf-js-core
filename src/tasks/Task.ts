import XHRPromise from '../utils/XHRPromise';
import StartError from '../errors/StartError';
import globals from '../constants/globals.json';
import DeleteError from '../errors/DeleteError';
import UpdateError from '../errors/UpdateError';
import ProcessError from '../errors/ProcessError';
import DownloadError from '../errors/DownloadError';
import ConnectError from '../errors/ConnectError';
import ILovePDFTool from '../types/ILovePDFTool';
import TaskFactory from './TaskFactory';
import Auth from '../auth/Auth';

export interface TaskI {
    /**
     * Starts task retrieving the assigned server and task id.
     */
    start: () => Promise<Task>;
    /**
     * Uploads a file to task.
     */
    upload: (file: string) => Promise<Task>;
    /**
     * Process uploaded files.
     */
    process: (params?: ProcessParams) => Promise<Task>;
    /**
     * Downloads processed files.
     */
    download: () => Promise<DownloadResponse>;
    /**
     * Deletes this task.
     */
    delete: () => Promise<Task>;
    /**
     * Connects a new task to execute it on the files resulting
     * from the previous tool.
     */
    connect: (nextTool: ILovePDFTool) => Promise<Task>;
}

export type TaskParams = {
    id?: string;
    server?: string;
    files?: Array<File>
};

export default abstract class Task implements TaskI {
    public abstract type: ILovePDFTool;

    private id: string | undefined;
    private server: string | undefined;
    private files: Array<File>;
    private auth: Auth;

    /**
     *
     * @param publicKey - API public key.
     * @param secretKey - API private key.
     * @param makeStart - If true, start is called on instantiate a Task.
     */
    constructor(auth: Auth, params: TaskParams = {}) {
        this.auth = auth;

        const { id, server, files } = params;

        if (!!id) {
            this.id = id;
        }

        if (!!server) {
            this.server = server;
        }

        if (!!files) {
            this.files = files;
        }
        else {
            this.files = [];
        }

    }

    public async start() {
        const xhr = new XHRPromise();
        const token = await this.auth.getToken();

        return xhr.get<StartGetResponse>(`${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/start/${ this.type }`, {
            headers: [
                [ 'Authorization', `Bearer ${ token }` ]
            ],
            transformResponse: res => { return JSON.parse(res) }
        })
        .then((data) => {
            const { task, server } = data;

            if (thereIsUndefined([ server, task ])) {
                throw new StartError('Task cannot be started');
            }

            this.server = server;
            this.id = task;

            return this;
        })
        .catch(e => {
            throw e;
        });
    }

    // Be careful. Docs don't say what's a file.
    async upload(file: string) {
        const xhr = new XHRPromise();
        const token = await this.auth.getToken();

        return xhr.post<UploadPostResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/upload`,
            {
                task: this.id,
                cloud_file: file
            },
            {
                headers: [
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: res => { return JSON.parse(res) }
            }
        )
        .then((data) => {
            const { server_filename } = data;
            if (thereIsUndefined([ server_filename ])) throw new UpdateError('File cannot be uploaded');

            this.files.push({ server_filename, filename: file });

            return this;
        })
        .catch(e => {
            throw e;
        });
    }

    async process(params: ProcessParams = {}) {
        const xhr = new XHRPromise();
        const token = await this.auth.getToken();

        return xhr.post<ProcessPostResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/process`,
            {
                task: this.id,
                tool: this.type,
                files: this.files,
                // Include optional params.
                ...params
            },
            {
                headers: [
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

            return this;
        })
        .catch(e => {
            throw e;
        });
    }

    async download() {
        const xhr = new XHRPromise();
        const token = await this.auth.getToken();

        return xhr.get<DownloadResponse>(`${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/download/${ this.id }`, {
            headers: [
                [ 'Authorization', `Bearer ${ token }` ]
            ]
        })
        .then((base64) => {
            // Be careful with this negation. It depends on server response:
            // Error if base64 === undefined || base64 === '' || base64 === null || base64 === false.
            if (!base64) throw new DownloadError('File cannot be downloaded');

            return base64;
        })
        .catch(e => {
            throw e;
        });
    }

    async delete() {
        const xhr = new XHRPromise();
        const token = await this.auth.getToken();

        return xhr.delete<DeleteResponse>(`${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/task/${ this.id }`, {
            headers: [
                [ 'Authorization', `Bearer ${ token }` ]
            ],
            transformResponse: res => { return JSON.parse(res) }
        })
        .then((data) => {
            const { download_filename, file_number, filesize,
                    output_extensions, output_filesize,
                    output_filenumber, process_start, server,
                    status, status_message, task, timer, tool } = data;

            if (thereIsUndefined([ download_filename, filesize,
                output_extensions, output_filenumber, output_filesize,
                status, timer, file_number, process_start,server,
                status_message, task, tool ])) {

                throw new DeleteError('Task cannot be deleted');
            }

            return this;
        })
        .catch(e => {
            throw e;
        });
    }

    async connect(nextTool: ILovePDFTool) {
        const xhr = new XHRPromise();
        const token = await this.auth.getToken();

        return xhr.post<ConnectResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/task/next`,
            {
                task: this.id,
                tool: nextTool
            },
            {
                headers: [
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: res => { return JSON.parse(res) }
            }
        )
        .then((data) => {
            const { task, files } = data;

            if (thereIsUndefined([ task, files ])) {
                throw new ConnectError('Task cannot be connected');
            }

            const newTaskFiles = Object.entries(files).map(([ server_filename, filename ]) => {
                return {
                    server_filename,
                    filename
                };
            });

            const taskFactory = new TaskFactory();
            // Create the next new task and populate its attrs with response data.
            // The server is the same than parent task.
            const newTask = taskFactory.newTask(nextTool, this.auth, { id: task, server: this.server, files: newTaskFiles });
            return newTask;
        })
        .catch(e => {
            throw e;
        });
    }

}

// ILovePDF type responses from API.

type StartGetResponse = {
    server?: string;
    task?: string;
};

type UploadPostResponse = {
    server_filename: string;
};

type ProcessPostResponse = {
    download_filename: string;
    filesize: number;
    output_filesize: number;
    output_filenumber: number;
    output_extensions: Array<string>;
    timer: string;
    status: string;
};

type DownloadResponse = string;

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

/**
 * 'files' property is an object with a key-value
 * representing server_filename-filename.
 */
type ConnectResponse = {
    task: string;
    files: {
        [ server_filename: string ]: string
    }
};

// -----

/**
 * Be careful: 'metas' property uses PascalCase due to PDF specification.
 * To know more, visit the next link:
 * http://www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/pdf_reference_1-7.pdf (page 844)
 */
export interface ProcessParams {
    metas?: {
        Title?: string;
        Author?: string;
        Subject?: string;
        Keywords?: string;
        Creator?: string;
        Producer?: string;
        CreationDate?: string;
        ModDate?: string;
        Trapped?: string;
    },
    ignore_errors?: boolean;
    ignore_password?: boolean;
    // Inside the string, can be used the next helpers:
    // {date} - current data.
    // {n} - file number.
    // {filename} - original filename.
    // {tool} - the current processing action.
    // Example: file_{n}_{date}
    output_filename?: string;
    // Inside the string, can be used the next helpers:
    // {date} - current data.
    // {n} - file number.
    // {filename} - original filename.
    // {app} - the current processing action.
    packaged_filename?: string;
    file_encryption_key?: string;
    try_pdf_repair?: boolean;
    custom_int?: number;
    custom_string?: string;
    webhook?: string;
};

type File = {
    filename: string;
    server_filename: string;
};

/**
 * True in case that there is an undefined value inside the array.
 * @param array - Array with values.
 */
function thereIsUndefined(array: Array<any>): boolean {
    for (const element of array) {
        if (element === undefined) return true;
    }

    return false;
}