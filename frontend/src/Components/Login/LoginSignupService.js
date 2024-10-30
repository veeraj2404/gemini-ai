import axios from 'axios';

const url = "http://localhost:3001";


export const signup = async (username, email, password) => {
    try {
        const response = await axios.post(`${url}/signup`, {username, email, password})
        return response.data;
    } catch (error) {
        throw error.response.data.message;
    }
};


export const login = async (email, password) => {
    try {
        const response = await axios.post(`${url}/login`, {email, password})
        return response.data;
    } catch (error) {
        throw error.response.data.message;
    }
};