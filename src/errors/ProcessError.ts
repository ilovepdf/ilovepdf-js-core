import BaseError from './BaseError';

export default class ProcessError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'ProcessError';
    }
    
}