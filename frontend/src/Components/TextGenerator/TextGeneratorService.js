
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

export const getImageContent = async (sessionId, userId, file) => {

    const formData = new FormData();
    formData.append('file', file); // Append the file
    formData.append('sessionId', sessionId); // Append the sessionId
    formData.append('userId', userId); // Append the userId
    
    try {
        const response = await axios.post(`${url}/imagecontent`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const uploadImageToChat = async (sessionId, userId,file) => {

    const formData = new FormData();
    formData.append('file', file); // Append the file
    formData.append('sessionId', sessionId); // Append the sessionId
    formData.append('userId', userId); // Append the userId
    
    try {
        const response = await axios.post(`${url}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};