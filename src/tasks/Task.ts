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
import FileNotExistsError from '../errors/FileNotExistsError';
import DownloadResponse from '../types/responses/DownloadResponse';
import StartResponse from '../types/responses/StartResponse';
import UploadResponse from '../types/responses/UploadResponse';
import DeleteResponse from '../types/responses/DeleteResponse';
import ConnectResponse from '../types/responses/ConnectResponse';
import TaskI, { ResponsesI, StatusI } from './TaskI';
import DeleteFileResponse from '../types/responses/DeleteFileResponse';
import { thereIsUndefined } from '../utils/typecheck';
import ElementAlreadyExistsError from '../errors/ElementAlreadyExistsError copy';
import ElementNotExistsError from '../errors/ElementNotExistError';

export type TaskParams = {
    id?: string;
    server?: string;
    files?: Array<BaseFile>
};

export default abstract class Task implements TaskI {
    public abstract type: ILovePDFTool;
    public readonly responses: ResponsesI;

    protected server: string;
    protected files: Array<BaseFile>;
    protected auth: Auth;
    protected xhr: XHRInterface;

    private _id: string;

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

    get id() {
        return this._id;
    }

    /**
     * @inheritdoc
     */
    public abstract getStatus(): Promise<StatusI>;

    /**
     * @inheritdoc
     */
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

            this.server = server!;
            this._id = this._id ? this._id : task!;

            // Keep response.
            this.responses.start = data;

            return this;
        })
        .catch(e => {
            throw e;
        });
    }

    /**
     * @inheritdoc
     */
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
            throw new ElementAlreadyExistsError();
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

    /**
     * @inheritdoc
     */
    public async deleteFile(file: BaseFile): Promise<TaskI> {
        const token = await this.auth.getToken();

        const index = this.files.indexOf(file);
        if (index === -1) throw new ElementNotExistsError();

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

    /**
     * @inheritdoc
     */
    public getFiles(): Array<BaseFile> {
        return this.files;
    }

    /**
     * @inheritdoc
     */
    public abstract process(params?: Object): Promise<TaskI>;

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

    /**
     * @inheritdoc
     */
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

    /**
     * @inheritdoc
     */
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