import Task from './Task';

const a = new Task('', '');
a.start()
.then(() => {
    return a.upload('http://africau.edu/images/default/sample.pdf');
})
.then(() => {
    return a.upload('http://africau.edu/images/default/sample.pdf');
})
.then(() => {
    return a.process();
})
// .then(() => {
//     return a.delete();
// })
.then(() => {
    return a.download();
})
.then(() => {
    console.log('DONE');
});