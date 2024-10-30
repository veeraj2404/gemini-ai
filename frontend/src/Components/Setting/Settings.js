
import axios from 'axios';

const url = "http://localhost:3001";

// Example of a GET request
export const getUser = async (userId) => {
    try {
        const response = await axios.get(`${url}/getUser`, {
            params: {
                userId: userId
            }
        })
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const updateProfile = async (user) => {
    try {
        const response = await axios.post(`${url}/updateProfile`, user)
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};