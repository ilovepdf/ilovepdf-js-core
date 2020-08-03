import ILovePDFApi from './ILovePDFApi';

export default ILovePDFApi;

const instance = new ILovePDFApi('project_public_c905dd1c01e9fd776983ca40d0a9d2f3_OUswa08040b8d2c7ca3ccda60d610a2ddce77');
const task = instance.newTask('merge');

task.start()
.then(() => {
    return task.upload('http://africau.edu/images/default/sample.pdf');
})
.then(() => {
    return task.upload('http://africau.edu/images/default/sample.pdf');
})
.then((task) => {
    return task.process();
})
.then((task) => {
    return task.download();
})
.then(() => {
    console.log('DONE');
});