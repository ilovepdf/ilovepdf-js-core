import BaseError from './BaseError';

export default class AuthError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'AuthError';
    }

}