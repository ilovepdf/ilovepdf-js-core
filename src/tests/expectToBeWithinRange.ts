import {expect} from "@jest/globals";

expect.extend({
    toBeWithinRange(actual: number, expected: number, errorMargin: number) {
        const { isNot } = this
        const printExpected = this.utils.printExpected
        const floor = expected - errorMargin
        const ceiling = expected + errorMargin
        const pass = actual >= floor && actual <= ceiling;
        return {
            pass,
            message: () =>
                `expected ${this.utils.printReceived(
                    actual,
                )} ${isNot ? 'not ' : ''}to be within range ${printExpected(
                    `${floor} - ${ceiling}`,
                )} (expected: ${printExpected(expected)}, errorMargin: ${printExpected(errorMargin)})`,
        }
    },
});

declare module 'expect' {
    interface AsymmetricMatchers {
        toBeWithinRange(expected: number, errorMargin: number): void;
    }
    interface Matchers<R> {
        toBeWithinRange(expected: number, errorMargin: number): R;
    }
}
