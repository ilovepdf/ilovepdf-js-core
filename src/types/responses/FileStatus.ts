/**
 * All possible statuses of a file.
 */
type FileStatus = 'FileSuccess' | 'FileWaiting' | 'WrongPassword' |
                  'TimeOut' | 'ServerFileNotFound' | 'DamagedFile' |
                  'NoImages' | 'OutOfRange' | 'NonConformant' | 'UnknowError';

export default FileStatus;