type Options = {
    headers?: Array< [ string, string ] >;
    transformResponse?: (response: any) => any;
};

export default interface XHRInterface {
    get: <T>(url: string, options?: Options) => Promise<T>;
    post: <T>(url: string, data?: any, options?: Options) => Promise<T>;
    put: <T>(url: string, data?: any, options?: Options) => Promise<T>;
    delete: <T>(url: string, options?: Options) => Promise<T>;
}