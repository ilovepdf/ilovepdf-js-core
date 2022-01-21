import Receiver, { ReceiverParams } from "./Receiver";

export default class Witness extends Receiver {

    constructor(name: string, email: string, params: Exclude<ReceiverParams, 'type'> = {}) {
        super(name, email, {...params, type: 'witness'});
    }

}
