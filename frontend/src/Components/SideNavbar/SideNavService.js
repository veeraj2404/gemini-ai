import axios from 'axios';

const url = "http://localhost:3001/task";


export const getSession = async (userId) => {
    try {
        const response = await axios.get(`${url}/getSession`, {
            params: {
                userId: userId
            }
        })
        return response.data.sessions || []
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const updateSessionName = async (sessionId, newSessionName, userId) => {
    try {
        const data = {
            sessionId: sessionId,
            sessionName: newSessionName,
            userId: userId
        }
        const response = await axios.post(`${url}/renamesession`, data)
        console.log(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export const deleteSession = async (sessionId, userId) => {
    try {
        const data = {
            sessionId: sessionId,
            userId: userId
        }
        const response = await axios.post(`${url}/deletesession`, data)
        console.log(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}