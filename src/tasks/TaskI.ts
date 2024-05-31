import ILovePDFTool from "../types/ILovePDFTool";
import DownloadResponse from "../types/responses/DownloadResponse";
import BaseFile from "./BaseFile";

export default interface TaskI {
    /**
     * Task id.
     */
    readonly id: string;
    /**
     * Account remaining files.
     */
    readonly remainingFiles: number | undefined;
    /**
     * Starts task retrieving the assigned server and task id.
     * @returns The task id.
     */
    start: () => Promise<string>;
    /**
     * Adds a file to task.
     * @param file - File or public URL.
     * @returns The added file.
     */
    addFile: (file: BaseFile | string, params?: AddFileParams) => Promise<BaseFile>;
    /**
     * Deletes a file previously created.
     * @param file - File to remove.
     */
    deleteFile: (file: BaseFile) => Promise<void>;
    /**
     * Process uploaded files.
     * @param params - Parameters for the process.
     * @returns Result metainformation.
     */
    process: (params?: Object) => Promise<object>;
    /**
     * Downloads processed files.
     * @returns Result of the process.
     */
    download: () => Promise<Uint8Array>;
    /**
     * Deletes this task.
     */
    delete: () => Promise<void>;
    /**
     * Connects a new task to execute it on the files resulting
     * from the previous tool.
     * @returns The new connected task.
     */
    connect: (nextTool: ILovePDFTool) => Promise<TaskI>;
}

export type AddFileParams = {
    info: boolean;
};
