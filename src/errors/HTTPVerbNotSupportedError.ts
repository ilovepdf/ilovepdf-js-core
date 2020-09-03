import BaseError from './BaseError';

export default class HTTPVerbNotSupportedError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'HTTPVerbNotSupportedError';
    }

}