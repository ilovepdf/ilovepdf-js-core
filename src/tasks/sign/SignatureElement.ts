type SignatureElement = {
    /**
     * signature: element where the signer has to sign.
     * initials: element where there will be signer initials.
     * name: element where there will be signer name.
     * date: element where there will be the sign date.
     * text: element with custom text.
     * input: input element to fill by the signer.
     */
    type: 'signature' | 'initials' | 'name' | 'date' | 'text' | 'input';
    /**
     * Position of the element inside the pdf page.
     */
    position: string;
    /**
     * Pages where put the element.
     */
    pages: string;
    /**
     * Element size.
     */
    size: number;
    /**
     * Element color.
     */
    color: string;
    /**
     * Element font.
     */
    font: string;
    /**
     * Element content.
     */
    content: string;
};

export default SignatureElement;