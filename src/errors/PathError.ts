import BaseError from './BaseError';

export default class PathError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'PathError';
    }

}