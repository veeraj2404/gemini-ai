
import axios from 'axios';

const url = "http://localhost:3001/task";

// Example of a GET request
export const getTextGeneration = async (history, text) => {
    try {
        const response = await axios.get(`${url}/textgenerate`, {
            params: {
                history,
                text
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
            history: endpoint,
            sessionId: sessionId,
            sessionName: sessionName,
            userId: userId
        }
        await axios.post(`${url}/saveChat`, data)
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