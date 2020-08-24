import JWT from "./JWT";
import XHRPromise from "../utils/XHRPromise";
import FileEncryptionKeyError from "../errors/FileEncryptionKeyError";


describe('JWT', () => {
    const xhr = new XHRPromise();

    it('throws a file_encryption_key error due to empty string', () => {
        expect(() => {
            new JWT(xhr,
                process.env.PUBLIC_KEY!,
                process.env.SECRET_KEY!,
                {
                    file_encryption_key: ''
                });
        }).toThrow(FileEncryptionKeyError);
    });

    it('throws a file_encryption_key error due to non 14, 16, 32 string length', () => {
        expect(() => {
            new JWT(xhr,
                process.env.PUBLIC_KEY!,
                process.env.SECRET_KEY!,
                {
                    file_encryption_key: 'key'
                });
        }).toThrow(FileEncryptionKeyError);
    });

    it('does not throw a file_encryption_key error due to has 14 chars', () => {
        new JWT(xhr,
            process.env.PUBLIC_KEY!,
            process.env.SECRET_KEY!,
            {
                file_encryption_key: '01234567890123'
            });
    });

    it('does not throw a file_encryption_key error due to has 16 chars', () => {
        new JWT(xhr,
            process.env.PUBLIC_KEY!,
            process.env.SECRET_KEY!,
            {
                file_encryption_key: '0123456789012345'
            });
    });

    it('does not throw a file_encryption_key error due to has 32 chars', () => {
        new JWT(xhr,
            process.env.PUBLIC_KEY!,
            process.env.SECRET_KEY!,
            {
                file_encryption_key: '01234567890123450123456789012345'
            });
    });

});