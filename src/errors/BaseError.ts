/**
 * Extend the built-in class Error cause a few problems with prototype.
 * To solve this problem, prototype is managed inside the constructor and
 * all the other errors inherits from this class.
 */
export default class BaseError extends Error {
    public __proto__: Error;

    constructor(message: string = '') {
        super(message);
        this.name = 'BaseError';
        // Set the prototype explicitly.
        this.__proto__ = new.target.prototype;
    }

}