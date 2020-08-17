import BaseError from './BaseError';

export default class SignerAlreadyExistsError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'SignerAlreadyExistsError';
    }

}