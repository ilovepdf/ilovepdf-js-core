import BaseError from './BaseError';

export default class FileAlreadyExistsError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'FileAlreadyExistsError';
    }

}