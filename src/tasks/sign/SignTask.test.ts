// import SignTask from "./SignTask";
// import dotenv from 'dotenv';
// import TaskFactory from "../TaskFactory";
// import XHRPromise from "../../utils/XHRPromise";
// import JWT from "../../auth/JWT";
// import SignatureFile from "./SignatureFile";
// import Signer from "./Signer";

// // Load env vars.
// dotenv.config();

// const taskFactory = new TaskFactory();
// const xhr = new XHRPromise();
// const auth = new JWT(xhr, process.env.PUBLIC_KEY!, process.env.SECRET_KEY!);

describe('Pass', () => {
    it('pass', () => {

    });
})

// describe('SignTask', () => {

//     it('signs', async () => {
//         const task = taskFactory.newTask('sign', auth, xhr) as SignTask;

//         return task.start()
//         .then(() => {
//             return task.addFile('sample.pdf');
//         })
//         .then(() => {
//             // Requester.
//             task.requester = {
//                 name: 'Diego',
//                 email: 'diego.lao@ilovepdf.com'
//             };

//             // Signer.
//             const file = task.getFiles()[0];
//             const signatureFile = new SignatureFile(file, [{
//                 type: 'signature',
//                 position: '50 50',
//                 pages: '1',
//                 size: 40,
//                 color: 'red',
//                 font: '',
//                 content: ''
//             }]);

//             const signer = new Signer('', '');
//             signer.addFile(signatureFile);
//             task.addSigner(signer);

//             return task.process();
//         })
//         .then(() => {
//             console.log('DONE');
//         })
//         .catch(err => {
//             console.log(err);
//         });

//     });

// });