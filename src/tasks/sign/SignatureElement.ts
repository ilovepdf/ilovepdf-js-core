type SignatureElement = {
    type: 'signature' | 'initials' | 'name' | 'date' | 'text' | 'input';
    position: string;
    pages: string;
    size: number;
    color: string;
    font: string;
    content: string;
};

export default SignatureElement;