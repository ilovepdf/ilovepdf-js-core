import TaskFactory from './TaskFactory';

const taskFactory = new TaskFactory();

const a = taskFactory.newTask('merge');
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
.then(() => {
    return a.connect('split')
})
// .then((task) => {
//     return task.upload('http://africau.edu/images/default/sample.pdf');
// })
.then((task) => {
    return task.process();
})
.then((task) => {
    return task.download();
})
.then(() => {
    console.log('DONE');
});