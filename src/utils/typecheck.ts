/**
 * True in case that there is an undefined value inside the array.
 * @param array - Array with values.
 */
export function thereIsUndefined(array: Array<any>): boolean {
    for (const element of array) {
        if (element === undefined) return true;
    }

    return false;
}