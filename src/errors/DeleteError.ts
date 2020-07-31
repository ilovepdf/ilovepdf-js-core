import BaseError from './BaseError';

export default class DeleteError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'DeleteError';
    }
    
}