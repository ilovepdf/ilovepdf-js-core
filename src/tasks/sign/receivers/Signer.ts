import Receiver, { ReceiverParams } from "./Receiver";

export default class Signer extends Receiver {

    constructor(name: string, email: string, params: Exclude<ReceiverParams, 'type'> = {}) {
        super(name, email, {...params, type: 'signer'});
    }

}
