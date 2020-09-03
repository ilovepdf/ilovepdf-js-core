export default interface Auth {
    readonly publicKey: string;
    readonly secretKey: string;
    getToken: () => Promise<string>;
}