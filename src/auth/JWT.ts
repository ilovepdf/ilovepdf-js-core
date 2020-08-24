import globals from '../constants/globals.json';
import AuthError from "../errors/AuthError";
import Auth from "./Auth";
import XHRInterface from "../utils/XHRInterface";
import JWTAlgorithms from 'jsonwebtoken';
import FileEncryptionKeyError from '../errors/FileEncryptionKeyError';

type JWTParams = {
    file_encryption_key?: string
}

export default class JWT implements Auth {
    // There are times between responses that servers demands
    // a little delay or it does not accept
    private static TIME_DELAY = 5;

    private xhr: XHRInterface;
    private token?: string;

    public readonly publicKey: string;
    public readonly secretKey: string;
    public readonly file_encryption_key: string | undefined;

    constructor(xhr: XHRInterface, publicKey: string, secretKey: string = '', params: JWTParams = {}) {
        this.xhr = xhr;
        this.publicKey = publicKey;
        this.secretKey = secretKey;
        this.file_encryption_key = params.file_encryption_key;
        // Validations.
        this.validateFileEncryptionKey(this.file_encryption_key);
    }

    private validateFileEncryptionKey(fileEncryptionKey: string | undefined) {
        if (typeof fileEncryptionKey === 'string') {
            if (fileEncryptionKey.length !== 14 && fileEncryptionKey.length !== 16 &&
                fileEncryptionKey.length !== 32) {

                throw new FileEncryptionKeyError('Encryption key shold have 16, 14 or 32 chars length');
            }
        }
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
            // Cache token.
            this.token = token;
            return token;
        });
    }

    /**
     * Verifies if this.token is well signed and not expired. In case of been
     * wrong-signed or expired, token is set to undefined to reset it.
     */
    private verifyToken() {

        if (!!this.token) {

            // When there is secret key, signature and expiration date can be validated.
            if (this.secretKey) {

                try {
                    // Throws an error if token is invalid.
                    JWTAlgorithms.verify(this.token, this.secretKey);
                }
                catch (error) {
                    this.token = undefined;
                }

            }
            else { // Otherwise, look only expiration date.
                const decoded = JWTAlgorithms.decode(this.token) as { exp: string };
                const { exp } = decoded;

                // Get epoch in seconds.
                const timeNow = Date.now() / 1000;

                // If it is an expired token, reset token cache.
                const isExpired = timeNow > Number(exp);
                if (isExpired) this.token = undefined;
            }

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
        // From milliseconds to seconds.
        const timeNow = Date.now() / 1000;

        const payload = {
            jti: this.publicKey,
            iss: globals.API_URL,
            // There is an error in server that does not accept
            // recent generated tokens. Due to this, iat time is
            // modified with the current time less a time delay.
            iat: timeNow - JWT.TIME_DELAY,
            file_encryption_key: this.file_encryption_key
        };

        // When execution comes here, this var always will have a value.
        const secretKey = this.secretKey;

        const token = JWTAlgorithms.sign(payload, secretKey);
        // Cache token.
        this.token = token;

        return token;
    }

}

type AuthResponse = {
    token: string;
}