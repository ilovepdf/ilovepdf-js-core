import BaseError from './BaseError';

export default class ElementAlreadyExistsError  extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'ElementAlreadyExistsError ';
    }

}