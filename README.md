![alt text](frontend/public/image.png)

# ChatGPT Clone using Gemini AI API

## Overview
This project is a ChatGPT clone built using the **Gemini AI API**, designed to deliver intelligent conversational experiences. The application provides real-time, context-aware responses, demonstrating the power of advanced AI tools in creating interactive chatbot solutions. This clone showcases seamless integration of modern AI capabilities in a user-friendly interface.

## Features
- **Natural Language Processing (NLP):** Provides human-like, context-aware responses.
- **Real-Time Communication:** Offers quick and dynamic responses in real-time.
- **Interactive UI:** A clean and intuitive interface for seamless user interaction.
- **Multi-Turn Conversations:** Maintains the context of ongoing chats for a coherent experience.
- **Customizable:** Easy to extend with additional features and tailored functionalities.
- **Upload** image files from the frontend.
- **Process** and analyze images on the backend using AI capabilities.
- **Display** analyzed data, such as detected labels or content descriptions, on the frontend.

## Technologies Used
- **Backend:**  [Gemini_AI_API/Express.js]
- **Frontend:** [React.js/HTML/CSS/Bootstrap.css]
- **Other Tools:** [Specify additional tools like Node.js, Bootstrap, etc., if used]

## Prerequisites
1. Node.js installed on your system.
2. A valid API key for the Google Cloud Vision API (or Gemini AI API).
3. (Optional) Google Cloud Service Account credentials for Vision API.

## Installation and Setup
1. Clone the Repository
    # git clone https://github.com/your-username/gemini-ai-vision.git
    # cd gemini-ai-vision
    
2. Set Up the Backend
    1. Navigate to the backend folder:
        cd backend
    2. Install dependencies:
        npm install
    3. Add your API key in a .env file:
        Create a .env file in the backend directory with the following content:
            API_KEY=[GOOGLE_AI_KEY]
    4. Start the backend server:
        node server.js

3. Set Up the Frontend
    1. Navigate to the frontend folder:
        cd frontend
    2. Install dependencies:
        npm install
    3. Start the React app:
        npm start

## Project Structure

gemini-ai-vision/
├── backend/
│   ├── server.js         # Node.js backend logic
|   ├── models            # Model
|   ├── routes            # api routes
│   ├── .env              # Environment variables (ignored in version control)
│   ├── package.json      # Backend dependencies
│   └── ...               # Other backend files
├── frontend/
│   ├── src/
|   |   ├── Assets         # Assets
│   │   ├── Components/    # Application component [Home/Login/SideNavbar/TextGenerator]
│   │   ├── App.js         # Main React app entry
│   │   └── ...            # Other frontend files
│   ├── package.json       # Frontend dependencies
│   └── ...                # Other frontend files
├── .gitignore             # Git ignore file
└── README.md              # This README file

## API References
1. Google Cloud Vision API Documentation:
   https://cloud.google.com/vision/docs
2. Gemini AI API (when available):
   Gemini AI Documentation (https://aistudio.google.com/)

## Acknowledgments
Thanks to Google Cloud Vision API for providing powerful image analysis tools.
Inspired by modern AI capabilities in Gemini AI.