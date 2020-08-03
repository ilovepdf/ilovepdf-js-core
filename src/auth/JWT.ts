import XHRPromise from "../utils/XHRPromise";
import globals from '../constants/globals.json';
import AuthError from "../errors/AuthError";
import Auth from "./Auth";

export default class JWT implements Auth {
    private publicKey: string;
    private secretKey?: string;
    private token?: string;

    constructor(publicKey: string, secretKey?: string) {
        this.publicKey = publicKey;
        this.secretKey = secretKey;
    }

    async getToken() {
        // If there are public and secret key, token can be generated
        // to not generate more delay connecting with server.
        if (!this.secretKey) {
            return this.getTokenFromServer();
        }
        else {
            return this.getTokenLocally();
        }
    }

    private async getTokenFromServer() {
        if (!!this.token) return this.token;

        const xhr = new XHRPromise();

        return xhr.post<AuthResponse>(`${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/auth`,
        {
            public_key: this.publicKey
        },
        {
            transformResponse: res => { return JSON.parse(res) }
        }
        )
        .then((data) => {
            const { token } = data;

            if (!token) {
                throw new AuthError('Auth token cannot be retrieved');
            }

            // Cache token.
            this.token = token;
            return token;
        })
        .catch(e => {
            throw e;
        });
    }

    private async getTokenLocally() {
        return this.generateToken();
    }

    private generateToken(): string {
        return 'LOLASO';
    }

}

type AuthResponse = {
    token: string;
}