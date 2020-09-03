import BaseError from './BaseError';

export default class StartError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'StartError';
    }
    
}