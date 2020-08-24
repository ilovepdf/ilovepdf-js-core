import BaseError from './BaseError';

export default class FileEncryptionKeyError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'FileEncryptionKeyError';
    }

}