/**
 * Extend the built-in class Error cause a few problems with prototype.
 * To solve this problem, prototype is managed inside the constructor and
 * all the other errors inherits from this class.
 */
export default class BaseError extends Error {

    constructor(message: string = '') {
        super(message);
        this.name = 'BaseError';
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, BaseError.prototype);
    }

}