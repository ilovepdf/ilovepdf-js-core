export default class BaseFile {
    public taskId: string;
    public serverFilename: string;
    public filename: string;

    constructor(taskId: string = '', serverFilename: string = '', filename: string = '') {
        this.taskId = taskId;
        this.serverFilename = serverFilename;
        this.filename = filename;
    }

};
