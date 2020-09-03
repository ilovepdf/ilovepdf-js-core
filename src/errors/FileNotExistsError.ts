import BaseError from './BaseError';

export default class FileNotExistsError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'FileNotExistsError';
    }

}