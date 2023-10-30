
import Client from "../server/models/clientModel.js"

export const findExistingClient = async (name,email,phone) => {
    
    const existingClient = await Client.findOne({
        $or: [
            { name },
            { email },
            { phone }
        ]
    });
    
    return existingClient;
}
