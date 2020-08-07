import ILovePDFTool from "../types/ILovePDFTool";
import DownloadResponse from "../types/responses/DownloadResponse";
import BaseFile from "./BaseFile";

export default interface TaskI {
    /**
     * Starts task retrieving the assigned server and task id.
     * @returns Itself.
     */
    start: () => Promise<TaskI>;
    /**
     * Adds a file to task.
     * @param file - File or public URL.
     * @returns Itself.
     */
    addFile: (file: BaseFile | string) => Promise<TaskI>;
    /**
     * Deletes a file previously created.
     * @param file - File to remove.
     */
    deleteFile: (file: BaseFile) => Promise<TaskI>;
    /**
     * @returns An array with all the uploaded files.
     */
    getFiles: () => Array<BaseFile>;
    /**
     * Process uploaded files.
     * @param params - Parameters for the process.
     * @returns Itself.
     */
    process: (params?: ProcessParams) => Promise<TaskI>;
    /**
     * Downloads processed files.
     * @returns Result of the process.
     */
    download: () => Promise<DownloadResponse>;
    /**
     * Deletes this task.
     * @returns Itself.
     */
    delete: () => Promise<TaskI>;
    /**
     * Connects a new task to execute it on the files resulting
     * from the previous tool.
     * @returns The new connected task.
     */
    connect: (nextTool: ILovePDFTool) => Promise<TaskI>;
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
