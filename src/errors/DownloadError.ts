import BaseError from './BaseError';

export default class DownloadError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'DownloadError';
    }

}