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
import XHRInterface from '../utils/XHRInterface';
import BaseFile from './BaseFile';
import PathError from '../errors/PathError';
import FileNotExistsError from '../errors/FileNotExistsError';
import DownloadResponse from '../types/responses/DownloadResponse';
import StartResponse from '../types/responses/StartResponse';
import UploadResponse from '../types/responses/UploadResponse';
import ProcessResponse from '../types/responses/ProcessResponse';
import DeleteResponse from '../types/responses/DeleteResponse';
import ConnectResponse from '../types/responses/ConnectResponse';
import TaskI, { Responses } from './TaskI';
import FileAlreadyExistsError from '../errors/FileAlreadyExistsError';
import DeleteFileResponse from '../types/responses/DeleteFileResponse';

export type TaskParams = {
    id?: string;
    server?: string;
    files?: Array<BaseFile>
};

export default abstract class Task implements TaskI {
    public abstract type: ILovePDFTool;
    public readonly responses: Responses;

    protected id: string | undefined;
    protected server: string | undefined;
    protected files: Array<BaseFile>;
    protected auth: Auth;
    protected xhr: XHRInterface;

    /**
     *
     * @param publicKey - API public key.
     * @param secretKey - API private key.
     * @param makeStart - If true, start is called on instantiate a Task.
     */
    constructor(auth: Auth, xhr: XHRInterface, params: TaskParams = {}) {
        this.auth = auth;
        this.xhr = xhr;

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

    public async start() {
        const token = await this.auth.getToken();

        return this.xhr.get<StartResponse>(
            `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/start/${ this.type }`, {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ],
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

            // Keep response.
            this.responses.start = data;

            return this;
        })
        .catch(e => {
            throw e;
        });
    }

    public async addFile(file: BaseFile | string) {
        if (file instanceof BaseFile) {
            return this.uploadFromFile(file);
        }

        return this.uploadFromUrl(file as string);
    }

    private async uploadFromUrl(fileUrl: string) {
        const token = await this.auth.getToken();

        return this.xhr.post<UploadResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/upload`,
            JSON.stringify(
                {
                    task: this.id,
                    cloud_file: fileUrl
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
            const { server_filename } = data;
            if (thereIsUndefined([ server_filename ])) throw new UpdateError('File cannot be uploaded');

            const file = new BaseFile(this.id!, server_filename, this.getBasename(fileUrl));
            this.files.push(file);

            // Keep response.
            this.responses.addFile = data;

            return this;
        })
        .catch(e => {
            throw e;
        });
    }

    private getBasename(path: string): string {
        const firstIndex = path.lastIndexOf('/') + 1;

        if (firstIndex === -1) throw new PathError('Path is malformed');

        const basename = path.substring(firstIndex);

        return basename;
    }

    private async uploadFromFile(file: BaseFile) {
        if (this.files.indexOf(file) !== -1) {
            throw new FileAlreadyExistsError();
        }

        const token = await this.auth.getToken();

        // Populate file with control data.
        file.taskId = this.id!;

        return this.xhr.post<UploadResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/upload`,
            file,
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

            // Populate file with control data.
            file.serverFilename = server_filename;
            // Insert inside the array of included files.
            this.files.push(file);

            return this;
        })
        .catch(e => {
            throw e;
        });
    }

    public async deleteFile(file: BaseFile): Promise<TaskI> {
        const token = await this.auth.getToken();

        const index = this.files.indexOf(file);
        if (index === -1) throw new FileNotExistsError();

        const fileToRemove = this.files[index];
        return this.xhr.delete<DeleteFileResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/upload/${ this.id }/${ fileToRemove.serverFilename }`,
            {
                headers: [
                    [ 'Content-Type', 'application/json;charset=UTF-8' ],
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: res => { return JSON.parse(res) }
            }
        )
        .then((data) => {
            // Remove file locally.
            // Be careful with parallelism problems, it is needed a
            // new search to remove the file.
            const index = this.files.indexOf(file);
            this.files.splice(index, 1);

            // Keep response.
            this.responses.deleteFile = data;

            return this;
        });
    }

    public getFiles(): Array<BaseFile> {
        return this.files;
    }

    public async process(params: ProcessParams = {}) {
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

    protected getFilesBodyFormat(): ProcessFilesBody {
        const files: ProcessFilesBody = this.files.map((file: BaseFile) => {
            return {
                server_filename: file.serverFilename,
                filename: file.filename,
                rotate: file.params.rotate,
                password: file.params.password
            };
        });

        return files;
    }

    public async download() {
        const token = await this.auth.getToken();

        return this.xhr.get<DownloadResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/download/${ this.id }`, {
            headers: [
                [ 'Authorization', `Bearer ${ token }` ]
            ],
            binary: true
        })
        .then((data) => {
            // Be careful with this negation. It depends on server response:
            // Error if data === undefined || data === '' || data === null || data === false.
            if (!data) throw new DownloadError('File cannot be downloaded');

            // Keep response.
            this.responses.download = data;

            return data;
        })
        .catch(e => {
            throw e;
        });
    }

    public async delete() {
        const token = await this.auth.getToken();

        return this.xhr.delete<DeleteResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/task/${ this.id }`,
            {
                headers: [
                    [ 'Content-Type', 'application/json;charset=UTF-8' ],
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: res => { return JSON.parse(res) }
            }
        )
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

            // Keep response.
            this.responses.delete = data;

            return this;
        })
        .catch(e => {
            throw e;
        });
    }

    public async connect(nextTool: ILovePDFTool) {
        const token = await this.auth.getToken();

        return this.xhr.post<ConnectResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/task/next`,
            JSON.stringify(
                {
                    task: this.id,
                    tool: nextTool
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
            const { task, files } = data;

            if (thereIsUndefined([ task, files ])) {
                throw new ConnectError('Task cannot be connected');
            }

            const newTaskFiles = Object.entries(files).map(([ server_filename, filename ]) => {
                return new BaseFile(this.id!, server_filename, filename);
            });

            // Keep response.
            this.responses.connect = data;

            const taskFactory = new TaskFactory();
            // Create the next new task and populate its attrs with response data.
            // The server is the same than parent task.
            const newTask = taskFactory.newTask(nextTool, this.auth, this.xhr, { id: task, server: this.server, files: newTaskFiles });
            return newTask;
        })
        .catch(e => {
            throw e;
        });
    }

}

type ProcessFilesBody = Array< {
    server_filename: string;
    filename: string;
    rotate?: number;
    password?: string;
} >;

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