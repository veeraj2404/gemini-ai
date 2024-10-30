
import axios from 'axios';

const url = "http://localhost:3001/task";

// Example of a GET request
export const getImageContent = async (prompt, file) => {

    const formData = new FormData();
    formData.append('file', file); // Append the file
    formData.append('prompt', prompt); // Append the prompt
    
    try {
        const response = await axios.post(`${url}/imagecontent`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data.message;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};