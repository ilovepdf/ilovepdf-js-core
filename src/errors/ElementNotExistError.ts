import BaseError from './BaseError';

export default class ElementNotExistError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'ElementNotExistError';
    }

}