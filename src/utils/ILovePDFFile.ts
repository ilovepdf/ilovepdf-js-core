import FormData from 'form-data';
import fs from 'fs';
import BaseFile, { BaseFileParams } from '../tasks/BaseFile';

export default class ILovePDFFile extends BaseFile {
    private file: Uint8Array;

    constructor(fileAbsolutePath: string, params?: BaseFileParams) {
        const basename = getBasename(fileAbsolutePath);
        super('', '', basename, params);

        this.file = fileAbsolutePath ? fs.readFileSync(fileAbsolutePath) : new Uint8Array();
    }

    static fromArray(arr: Uint8Array, filename: string, params?: BaseFileParams): ILovePDFFile {
        const ilovepdfFile =  new ILovePDFFile('', params);
        ilovepdfFile.filename = filename;
        ilovepdfFile.file = arr;
        return ilovepdfFile;
    }

    get data(): FormData {
        // Create each time due to 'task'
        // property could change previously.
        const formData = new FormData();
        formData.append('task', this.taskId);
        formData.append('file', this.file, { filename: this.filename });
        if (this.info) { // Get information if required.
            formData.append('pdfinfo', 1);
        }
        return formData;
    }

}

function getBasename(path: string): string {
    const firstIndex = path.lastIndexOf('/') + 1;

    if (firstIndex === -1) throw new Error('Path is malformed');

    const basename = path.substring(firstIndex);

    return basename;
}
