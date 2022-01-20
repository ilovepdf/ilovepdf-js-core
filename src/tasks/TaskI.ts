import ILovePDFTool from "../types/ILovePDFTool";
import DownloadResponse from "../types/responses/DownloadResponse";
import BaseFile from "./BaseFile";
import StartResponse from "../types/responses/StartResponse";
import DeleteResponse from "../types/responses/DeleteResponse";
import ConnectResponse from "../types/responses/ConnectResponse";
import UploadResponse from "../types/responses/UploadResponse";
import DeleteFileResponse from "../types/responses/DeleteFileResponse";

export default interface TaskI {
    /**
     * Task id.
     */
    readonly id: string;
    /**
     * Server response from each function call.
     */
    readonly responses: ResponsesI;
    /**
     * Starts task retrieving the assigned server and task id.
     * @returns Itself.
     */
    start: () => Promise<void>;
    /**
     * Adds a file to task.
     * @param file - File or public URL.
     * @returns Itself.
     */
    addFile: (file: BaseFile | string) => Promise<BaseFile>;
    /**
     * Deletes a file previously created.
     * @param file - File to remove.
     */
    deleteFile: (file: BaseFile) => Promise<void>;
    /**
     * Process uploaded files.
     * @param params - Parameters for the process.
     * @returns Itself.
     */
    process: (params?: Object) => Promise<TaskI>;
    /**
     * Downloads processed files.
     * @returns Result of the process.
     */
    download: () => Promise<DownloadResponse>;
    /**
     * Deletes this task.
     * @returns Itself.
     */
    delete: () => Promise<void>;
    /**
     * Connects a new task to execute it on the files resulting
     * from the previous tool.
     * @returns The new connected task.
     */
    connect: (nextTool: ILovePDFTool) => Promise<TaskI>;
}

/**
 * Object to save server responses.
 */
export type ResponsesI = {
    start: StartResponse | null;
    addFile: UploadResponse | null;
    deleteFile: DeleteFileResponse | null;
    process: Object | null;
    download: DownloadResponse | null;
    delete: DeleteResponse | null;
    connect: ConnectResponse | null;
};
