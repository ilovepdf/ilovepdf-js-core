export function inRange(value: number, desiredValue: number, range: [ number, number ] | number): boolean {

    if (typeof range === 'number') {
        const min = desiredValue - range;
        const max = desiredValue + range;
        return value >= min && value <= max;
    }
    else {
        return value >= range[0] && value <= range[1];
    }

}