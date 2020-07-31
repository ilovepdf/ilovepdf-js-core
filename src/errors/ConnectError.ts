import BaseError from './BaseError';

export default class ConnectError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'ConnectError';
    }

}