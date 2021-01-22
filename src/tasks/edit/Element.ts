export interface ElementParams {
    type: 'text' | 'image' | 'svg';
    dimensions: { w: number, h: number }
    coordinates: { x: number, y: number };
    zindex?: 0;
    /**
     *
     */
    pages?: string;
    /**
     * Rotation degrees applied on the element. Inverval [0, 360] .
     */
    rotation?: number;
    /**
     * Percentage of opacity for the element. Interval of integers [1, 100].
     */
    opacity?: number;
}

const DEFAULT_ELEMENT_PARAMS: Omit<ElementParams, 'type' | 'dimensions' | 'coordinates'> = {
    pages: '1',
    zindex: 0,
};

export default abstract class Element {
    readonly params: ElementParams;

    constructor(params: ElementParams) {
        this.params = { ...DEFAULT_ELEMENT_PARAMS, ...params };
    }

}