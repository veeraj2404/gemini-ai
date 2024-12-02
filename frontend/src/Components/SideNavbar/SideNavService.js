import axios from 'axios';

const url = "http://localhost:3001/task";


export const getSession = async (userId) => {
    try {
        const response = await axios.get(`${url}/getSession`, {
            params: {
                userId: userId
            }
        })
        return response.data.sessions
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getImageSession = async (userId) => {
    try {
        const response = await axios.get(`${url}/getImageSession`, {
            params: {
                userId: userId
            }
        })
        return response.data.sessions
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const updateSessionName = async (sessionId, sessionName, userId) => {
    try {
        const data = {
            sessionId,
            sessionName,
            userId
        }
        const response = await axios.post(`${url}/renamesession`, data)
        return response.data.message
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const updateImageSessionName = async (imageSessionId, imageSessionName, userId) => {
    try {
        const data = {
            imageSessionId,
            imageSessionName,
            userId: userId
        }
        const response = await axios.post(`${url}/renameimagesession`, data)
        return response.data.message
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const deleteSession = async (sessionId, userId) => {
    try {
        const data = {
            sessionId,
            userId
        }
        const response = await axios.post(`${url}/deletesession`, data)
        return response.data.message
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const deleteImageSession = async (imageSessionId, userId) => {
    try {
        const data = {
            imageSessionId,
            userId
        }
        const response = await axios.post(`${url}/deleteimagesession`, data)
        return response.data.message
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const updatePriority = async (sessionId, priority, userId) => {
    try {
        const data = {
            sessionId,
            priority,
            userId
        }
        const response = await axios.post(`${url}/updatepriority`, data)
        return response.data.message
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const updateImagePriority = async (imageSessionId, priority, userId) => {
    try {
        const data = {
            imageSessionId,
            priority,
            userId
        }
        const response = await axios.post(`${url}/updateimagepriority`, data)
        return response.data.message
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const downloadChatPdf = async (sessionName, history) => {
    const response = await axios.get(`${url}/generate-pdf`, {
        params: { sessionName, history },
        responseType: 'blob', // To handle binary data
    });
    return response.data;
};
