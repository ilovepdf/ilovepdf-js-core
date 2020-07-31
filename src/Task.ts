import XHRPromise from './utils/XHRPromise';
import StartError from './errors/StartError';
import globals from './constants/globals.json';
import DeleteError from './errors/DeleteError';
import UpdateError from './errors/UpdateError';
import ProcessError from './errors/ProcessError';
import DownloadError from './errors/DownloadError';

interface TaskI {
    /**
     * Starts task retrieving the assigned server and task id.
     */
    start: () => Promise<StartGetResponse>;
    /**
     * Uploads a file to task.
     */
    upload: (file: string) => Promise<UploadPostResponse>;
    /**
     * Process uploaded files.
     */
    process: () => Promise<ProcessPostResponse>;
    /**
     * Downloads processed files.
     */
    download: () => Promise<DownloadResponse>;
    /**
     * Deletes this task.
     */
    delete: () => Promise<DeleteResponse>;
    /**
     * Connects a new task to execute it on the files resulting
     * from the previous tool.
     */
    connect: (nextTool: ILovePDFTool) => Promise<void>;
}

type ILovePDFTool = 'compress' | 'extract' | 'htmlpdf' | 'imagepdf' | 'merge' |
                    'officepdf' | 'pagenumber' | 'pdfa' | 'pdfjpg' | 'protect' |
                    'repair' | 'rotate' | 'split' | 'unlock' | 'validatepdfa' |
                    'watermark';

export default class Task implements TaskI {
    private id: string | undefined;
    private server: string | undefined;
    private files: Array<File>;

    /**
     *
     * @param publicKey - API public key.
     * @param secretKey - API private key.
     * @param makeStart - If true, start is called on instantiate a Task.
     */
    constructor(publicKey: string, secretKey: string, makeStart: boolean = false) {

        if (makeStart) {
            this.start();
        }

        this.files = [];
    }

    /**
     * Creates a Task.
     */
    public async start() {
        const xhr = new XHRPromise();

        return xhr.get<StartGetResponse>(`${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/start/merge`, {
            headers: [
                [ 'Authorization', `Bearer ${ globals.AUTH_TOKEN }` ]
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

            return data;

            console.log('START');
            console.log(data);
        })
        .catch(e => {
            throw e;
        });
    }

    // Be careful. Docs don't say what's a file.
    async upload(file: string) {
        const xhr = new XHRPromise();

        return xhr.post<UploadPostResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/upload`,
            {
                task: this.id,
                cloud_file: file
            },
            {
                headers: [
                    [ 'Authorization', `Bearer ${ globals.AUTH_TOKEN }` ]
                ],
                transformResponse: res => { return JSON.parse(res) }
            }
        )
        .then((data) => {
            const { server_filename } = data;
            if (thereIsUndefined([ server_filename ])) throw new UpdateError('File could not be uploaded');

            this.files.push({ server_filename, filename: file });

            return data;

            console.log('UPLOAD');
            console.log(data);
        })
        .catch(e => {
            throw e;
        });
    }

    async process() {
        const xhr = new XHRPromise();

        return xhr.post<ProcessPostResponse>(
            `${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/process`,
            {
                task: this.id,
                tool: 'merge',
                files: this.files
            },
            {
                headers: [
                    [ 'Authorization', `Bearer ${ globals.AUTH_TOKEN }` ]
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

                throw new ProcessError('Task could not be processed');
            }

            return data;

            console.log('PROCESS');
            console.log(data);

        })
        .catch(e => {
            throw e;
        });
    }

    async download() {
        const xhr = new XHRPromise();

        return xhr.get<DownloadResponse>(`${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/download/${ this.id }`, {
            headers: [
                [ 'Authorization', `Bearer ${ globals.AUTH_TOKEN }` ]
            ]
        })
        .then((base64) => {
            // Be careful with this negation. It depends on server response:
            // Error if base64 === undefined || base64 === '' || base64 === null || base64 === false.
            if (!base64) throw new DownloadError('File could not be downloaded');

            return base64;
        })
        .catch(e => {
            throw e;
        });
    }

    async delete() {
        const xhr = new XHRPromise();

        return xhr.delete<DeleteResponse>(`${ globals.API_URL_PROTOCOL }://${ this.server }/${ globals.API_VERSION }/task/${ this.id }`, {
            headers: [
                [ 'Authorization', `Bearer ${ globals.AUTH_TOKEN }` ]
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

                throw new DeleteError('Task could not be deleted');
            }

            return data;

            console.log('DELETE');
            console.log(data);
        })
        .catch(e => {
            throw e;
        });
    }

    async connect(nextTool: ILovePDFTool) {}

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

// -----

type File = {
    filename: string;
    server_filename: string;
};

/**
 * True in case that there is an undefined value inside the array.
 * @param array Array with values.
 */
function thereIsUndefined(array: Array<any>): boolean {
    for (const element of array) {
        if (element === undefined) return true;
    }

    return false;
}