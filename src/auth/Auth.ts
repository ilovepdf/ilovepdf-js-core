export default interface Auth {
    getToken: () => Promise<string>;
}