export interface BaseFileParams {
    rotate?: 0 | 90 | 180 | 270;
    password?: string;
}

export default class BaseFile {
    public taskId: string;
    public serverFilename: string;
    public filename: string;
    public info: Info | undefined;
    public params: BaseFileParams;

    constructor(taskId: string = '', serverFilename: string = '',
                filename: string = '', params: BaseFileParams = {}) {

        this.taskId = taskId;
        this.serverFilename = serverFilename;
        this.filename = filename;
        this.params = params;
    }

};

type Info = {
    pageNumber: number,
    pageSizes: Array<[ number, number ]>,
}
