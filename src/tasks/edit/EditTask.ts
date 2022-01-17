import Auth from "../../auth/Auth";
import ILovePDFTool from "../../types/ILovePDFTool";
import XHRInterface from "../../utils/XHRInterface";
import TaskI from "../TaskI";
import { TaskParams } from "../Task";
import TaskBaseProcess, { ProcessParams } from "../TaskBaseProcess";
import Element from "./Element";
import Image from "./Image";
import ElementNotExistsError from "../../errors/ElementNotExistError";
import ElementAlreadyExistsError from "../../errors/ElementAlreadyExistsError";
import Text from "./Text";
import Svg from "./Svg";

interface EditTaskParams extends ProcessParams {
    elements?: Array<Element>;
}

export default class EditTask extends TaskBaseProcess {
    public type: ILovePDFTool;
    private elements: Array<Element>;

    constructor(auth: Auth, xhr: XHRInterface , params: TaskParams = {}) {
        super(auth, xhr, params);

        this.type = 'editpdf';
        this.elements = [];
    }

    /**
     * @inheritdoc
     * @override
     * @param params - ProcessParams object with extra attrs for this service.
     */
    process(params?: EditTaskParams) {
        // Get elements information.
        const elements = this.elements.map((item) => (
            item.params
        ));

        const paramsWithElements = {
            ...params,
            elements,
        };

        return super.process(paramsWithElements);
    }

    // Use specific types explicitly in order to cast properties properly.
    addElement(element: Text | Image | Svg): TaskI {
        const index = this.elements.indexOf(element);

        if (index !== -1) {
            throw new ElementAlreadyExistsError();
        }

        this.elements.push(element);

        return this;
    }

    deleteElement(element: Text | Image | Svg): TaskI {
        const index = this.elements.indexOf(element);

        if (index === -1) {
            throw new ElementNotExistsError();
        }

        this.elements.splice(index, 1);

        return this;
    }

}