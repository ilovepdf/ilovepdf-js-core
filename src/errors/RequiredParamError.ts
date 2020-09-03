import BaseError from './BaseError';

export default class RequiredParamError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'RequiredParamError';
    }

}