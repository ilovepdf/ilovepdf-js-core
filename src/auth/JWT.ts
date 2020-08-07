import globals from '../constants/globals.json';
import AuthError from "../errors/AuthError";
import Auth from "./Auth";
import XHRInterface from "../utils/XHRInterface";
import JWTAlgorithms from 'jsonwebtoken';

export default class JWT implements Auth {
    // There are times between responses that servers demands
    // a little delay or it does not accept
    private static TIME_DELAY = 5;

    private xhr: XHRInterface;
    private token?: string;

    public readonly publicKey: string;
    public readonly secretKey: string;

    constructor(xhr: XHRInterface, publicKey: string, secretKey: string = '') {
        this.xhr = xhr;
        this.publicKey = publicKey;
        this.secretKey = secretKey;
    }

    async getToken() {
        this.verifyToken();
        // Use cache if there is a valid token.
        if (!!this.token) return Promise.resolve(this.token);

        // If there are public and secret key, token can be generated
        // to not generate more delay connecting with server.
        let tokenPromise;
        if (!this.secretKey) {
            tokenPromise = this.getTokenFromServer();
        }
        else {
            tokenPromise = this.getTokenLocally();
        }

        return tokenPromise.then(token => {
            this.token = token;
            // Cache token.
            return token;
        });
    }

    /**
     * Verifies if this.token is not expired. In case of been an expired token,
     * it sets to undefined to reset it.
     */
    private verifyToken() {
        // If there is not token, return false.
        if (!!this.token) {
            const token = this.token;

            const decoded = JWTAlgorithms.decode(token) as { exp: string };
            const { exp } = decoded;

            // Get epoch in seconds.
            const timeNow = Date.now() / 1000;

            // If it is an expired token, reset token cache.
            const isExpired = timeNow > Number(exp);
            if (isExpired) this.token = undefined;
        }

    }

    private async getTokenFromServer(): Promise<string> {
        return this.xhr.post<AuthResponse>(`${ globals.API_URL_PROTOCOL }://${ globals.API_URL }/${ globals.API_VERSION }/auth`,
        JSON.stringify(
            {
                public_key: this.publicKey
            }
        ),
        {
            headers: [
                [ 'Content-Type', 'application/json;charset=UTF-8' ]
            ],
            transformResponse: res => { return JSON.parse(res) }
        }
        )
        .then((data) => {
            const { token } = data;

            if (!token) {
                throw new AuthError('Auth token cannot be retrieved');
            }

            return token;
        })
        .catch(e => {
            throw e;
        });
    }

    private async getTokenLocally(): Promise<string> {
        const timeNow = Date.now() / 1000;

        const payload = {
            jti: this.publicKey,
            iss: globals.API_URL,
            // There is an error in server that does not accept
            // recent generated tokens. Due to this, iat time is
            // modified with the current time less a time delay.
            iat: timeNow - JWT.TIME_DELAY
        };

        // When execution comes here, this var always will have a value.
        const secretKey = this.secretKey!;

        const token = JWTAlgorithms.sign(payload, secretKey , { algorithm: 'HS256' });
        // Cache token.
        this.token = token;

        return token;
    }

}

type AuthResponse = {
    token: string;
}