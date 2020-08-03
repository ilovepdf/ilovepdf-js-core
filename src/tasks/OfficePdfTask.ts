import Task from "./Task";
import ILovePDFTool from "../types/ILovePDFTool";
import { TaskParams } from './Task';
import Auth from "../auth/Auth";
import XHRInterface from "../utils/XHRInterface";

export default class OfficePdfTask extends Task {
    public type: ILovePDFTool;

    constructor(auth: Auth, xhr: XHRInterface , params: TaskParams = {}) {
        super(auth, xhr, params);

        this.type = 'officepdf';
    }

}