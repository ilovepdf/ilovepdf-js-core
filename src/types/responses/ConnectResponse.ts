/**
 * 'files' property is an object with a key-value
 * representing server_filename-filename.
 */
type ConnectResponse = {
    task: string;
    files: {
        [ server_filename: string ]: string
    }
};

export default ConnectResponse;