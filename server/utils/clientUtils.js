
import Client from "../models/clientModel.js"

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

export const validateAge = (birthdate) => {
                    // Calculate the age based on the provided birthday
                    const birthDate = new Date(birthdate);
                    const currentDate = new Date();
                    const age = currentDate.getFullYear() - birthDate.getFullYear();
    
                    // Adjust age for leap years
                    if (currentDate.getMonth() < birthDate.getMonth() ||
                        (currentDate.getMonth() === birthDate.getMonth() && currentDate.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    return age;
}