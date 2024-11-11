
import axios from 'axios';

const url = "http://localhost:3001/task";

// Example of a GET request
export const getTextGeneration = async (endpoint) => {
    try {
        const response = await axios.get(`${url}/textgenerate`, {
            params: {
                text: endpoint
            }
        })
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const saveChatToDatabase = async (endpoint, sessionId, sessionName, userId) => {
    try {
        const data = {
            chat: endpoint,
            sessionId: sessionId,
            sessionName: sessionName,
            userId: userId
        }
        const response = await axios.post(`${url}/saveChat`, data)
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getChat = async (sessionId, userId) => {
    try {
        const response = await axios.get(`${url}/getChat`, {
            params: {
                sessionId: sessionId,
                userId: userId
            }
        })
        return response.data || []
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};