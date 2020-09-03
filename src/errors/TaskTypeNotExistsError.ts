import BaseError from './BaseError';

export default class TaskTypeNotExistsError extends BaseError {

    constructor(message: string = '') {
        super(message);
        this.name = 'TaskTypeNotExistsError';
    }

}