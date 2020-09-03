export type XHROptions = {
    headers?: Array< [ string, string ] >;
    transformResponse?: (response: any) => any;
    binary?: boolean;
};

export default interface XHRInterface {
    get: <T>(url: string, options?: XHROptions) => Promise<T>;
    post: <T>(url: string, data?: any, options?: XHROptions) => Promise<T>;
    put: <T>(url: string, data?: any, options?: XHROptions) => Promise<T>;
    delete: <T>(url: string, options?: XHROptions) => Promise<T>;
}