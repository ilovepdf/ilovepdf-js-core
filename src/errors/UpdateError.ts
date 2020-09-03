import BaseError from './BaseError';

export default class UpdateError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'UpdateError';
    }
    
}