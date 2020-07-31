import BaseError from './BaseError';

export default class ServerError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'ServerError';
    }

}