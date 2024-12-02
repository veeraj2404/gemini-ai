
import axios from 'axios';

const url = "http://localhost:3001/task";

// Example of a GET request
export const getImageChat = async (imageSessionId, userId) => {
    try {
        const response = await axios.get(`${url}/getImageChat`, {
            params: {
                imageSessionId: imageSessionId,
                userId: userId
            }
        })
        return response.data || []
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getImageContent = async (imageSessionId, userId, file, text) => {

    const formData = new FormData();
    formData.append('file', file); // Append the file
    formData.append('text', text); // Append the file
    formData.append('imageSessionId', imageSessionId); // Append the sessionId
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

export const uploadImageToChat = async (imageSessionId, userId, file, text) => {

    const formData = new FormData();
    formData.append('file', file); // Append the file
    formData.append('text', text); // Append the file
    formData.append('imageSessionId', imageSessionId); // Append the sessionId
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