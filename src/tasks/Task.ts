import StartError from '../errors/StartError';
import globals from '../constants/globals.json';
import DeleteError from '../errors/DeleteError';
import UpdateError from '../errors/UpdateError';
import DownloadError from '../errors/DownloadError';
import ConnectError from '../errors/ConnectError';
import ILovePDFTool from '../types/ILovePDFTool';
import TaskFactory from './TaskFactory';
import Auth from '../auth/Auth';
import XHRInterface from '../utils/XHRInterface';
import BaseFile from './BaseFile';
import PathError from '../errors/PathError';
import DownloadResponse from '../types/responses/DownloadResponse';
import StartResponse from '../types/responses/StartResponse';
import UploadResponse from '../types/responses/UploadResponse';
import DeleteResponse from '../types/responses/DeleteResponse';
import ConnectResponse from '../types/responses/ConnectResponse';
import TaskI from './TaskI';
import DeleteFileResponse from '../types/responses/DeleteFileResponse';
import { thereIsUndefined } from '../utils/typecheck';
import ElementAlreadyExistsError from '../errors/ElementAlreadyExistsError';
import ElementNotExistsError from '../errors/ElementNotExistError';

export type TaskParams = {
    id?: string;
    server?: string;
    files?: Array<BaseFile>
};

export default abstract class Task implements TaskI {
    public abstract type: ILovePDFTool;

    protected server: string;
    protected files: Array<BaseFile>;
    protected auth: Auth;
    protected xhr: XHRInterface;

    private _id: string;
    private _remainingFiles: number | undefined;

    get id() { return this._id }

    get remainingFiles() { return this._remainingFiles }

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

        this._id = !!id ? id : '';

        this.server = !!server ? server : '';

        if (!!files) {
            this.files = files;
        }
        else {
            this.files = [];
        }
    }

    /**
     * @inheritdoc
     */
    public async start(): Promise<string> {
        const token = await this.auth.getToken();

        const data = await this.xhr.get<StartResponse>(
            `${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/start/${ this.type }`, {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ],
                [ 'Authorization', `Bearer ${ token }` ]
            ],
            transformResponse: res => { return JSON.parse(res) }
        });

        const { task, server, remaining_files } = data;

        if (thereIsUndefined([ server, task ])) {
            throw new StartError('Task cannot be started');
        }

        this.server = server!;
        this._id = this._id ? this._id : task!;
        this._remainingFiles = remaining_files

        return task;
    }

    /**
     * @inheritdoc
     */
    public async addFile(file: BaseFile | string): Promise<BaseFile> {
        if (typeof file === 'string') {
            return this.uploadFromUrl(file);
        }

        return this.uploadFromFile(file);
    }

    private async uploadFromUrl(fileUrl: string): Promise<BaseFile> {
        const token = await this.auth.getToken();

        const data = await this.xhr.post<UploadResponse>(
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
        );

        const { server_filename } = data;
        if (thereIsUndefined([ server_filename ])) throw new UpdateError('File cannot be uploaded');

        const file = new BaseFile(this.id!, server_filename, this.getBasename(fileUrl));
        this.files.push(file);

        return file;
    }

    private getBasename(path: string): string {
        const firstIndex = path.lastIndexOf('/') + 1;

        if (firstIndex === -1) throw new PathError('Path is malformed');

        const basename = path.substring(firstIndex);

        return basename;
    }

    private async uploadFromFile(file: BaseFile): Promise<BaseFile> {
        if (this.files.indexOf(file) !== -1) {
            throw new ElementAlreadyExistsError();
        }

        const token = await this.auth.getToken();

        // Populate file with control data.
        file.taskId = this.id!;

        const data = await this.xhr.post<UploadResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/upload`,
            file,
            {
                headers: [
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: res => { return JSON.parse(res) }
            }
        );

        const { server_filename } = data;
        if (thereIsUndefined([ server_filename ])) throw new UpdateError('File cannot be uploaded');

        // Populate file with control data.
        file.serverFilename = server_filename;
        // Insert inside the array of included files.
        this.files.push(file);

        return file;
    }

    /**
     * @inheritdoc
     */
    public async deleteFile(file: BaseFile): Promise<void> {
        const token = await this.auth.getToken();

        const index = this.files.indexOf(file);
        if (index === -1) throw new ElementNotExistsError();

        const fileToRemove = this.files[index];
        await this.xhr.delete<DeleteFileResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/upload/${ this.id }/${ fileToRemove.serverFilename }`,
            {
                headers: [
                    [ 'Content-Type', 'application/json;charset=UTF-8' ],
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: res => { return JSON.parse(res) }
            }
        );

        // Remove file locally.
        this.files.splice(index, 1);
    }

    /**
     * @inheritdoc
     */
    public abstract process(params?: Object): Promise<object>;

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

    /**
     * @inheritdoc
     */
    public async download() {
        const token = await this.auth.getToken();

        const data = await this.xhr.get<Uint8Array>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/download/${ this.id }`, {
            headers: [
                [ 'Authorization', `Bearer ${ token }` ]
            ],
            binary: true
        });

        // Be careful with this negation. It depends on server response:
        // Error if data === undefined || data === '' || data === null || data === false.
        if (!data) throw new DownloadError('File cannot be downloaded');

        return data;
    }

    /**
     * @inheritdoc
     */
    public async delete(): Promise<void> {
        const token = await this.auth.getToken();

        const data = await this.xhr.delete<DeleteResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/task/${ this.id }`,
            {
                headers: [
                    [ 'Content-Type', 'application/json;charset=UTF-8' ],
                    [ 'Authorization', `Bearer ${ token }` ]
                ],
                transformResponse: res => { return JSON.parse(res) }
            }
        );

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

    }

    /**
     * @inheritdoc
     */
    public async connect(nextTool: ILovePDFTool) {
        const token = await this.auth.getToken();

        const data = await this.xhr.post<ConnectResponse>(
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
        );

        const { task, files } = data;

        if (thereIsUndefined([ task, files ])) {
            throw new ConnectError('Task cannot be connected');
        }

        const newTaskFiles = Object.entries(files).map(([ server_filename, filename ]) => {
            return new BaseFile(this.id!, server_filename, filename);
        });

        const taskFactory = new TaskFactory();
        // Create the next new task and populate its attrs with response data.
        // The server is the same than parent task.
        const newTask = taskFactory.newTask(nextTool, this.auth, this.xhr, { id: task, server: this.server, files: newTaskFiles });
        return newTask;
    }

}

type ProcessFilesBody = Array< {
    server_filename: string;
    filename: string;
    rotate?: number;
    password?: string;
} >;
