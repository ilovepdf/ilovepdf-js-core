type Requester = {
    // Requester name.
    name: string;
    // Requester email.
    email: string;
    // Requester number to facilitate filtering.
    custom_int?: number;
    // Requester string to facilitate filtering.
    custom_string?: string;
};

export default Requester;