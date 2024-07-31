import FormData from 'form-data';
import fs from 'fs';
import BaseFile, { BaseFileParams } from '../tasks/BaseFile';

export default class ILovePDFFile extends BaseFile {
    private file: Buffer;

    constructor(fileAbsolutePath: string, params?: BaseFileParams) {
        const basename = getBasename(fileAbsolutePath);
        super('', '', basename, params);

        const file = fs.readFileSync(fileAbsolutePath);
        this.file = file;
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

    isILovePDFFile(): this is ILovePDFFile {
        return true;
    }

}

function getBasename(path: string): string {
    const firstIndex = path.lastIndexOf('/') + 1;

    if (firstIndex === -1) throw new Error('Path is malformed');

    const basename = path.substring(firstIndex);

    return basename;
}
