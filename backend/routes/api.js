const express = require("express");
const router = express.Router();
const multer = require('multer');
const { GoogleAIFileManager } = require('@google/generative-ai/server')
const { GoogleGenerativeAI } = require('@google/generative-ai');

//import models
const Chats = require('../models/Chats')
const User = require('../models/User');

// Initialize Google AI File Manager
const fileManager = new GoogleAIFileManager(process.env.API_KEY); // Adjust if necessary
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Set up multer for file upload
const upload = multer({ dest: 'uploads/' }); // Files will be saved to the "uploads" directory

// API endpoint for generating content
router.post('/imagecontent', upload.single('file'), async (req, res) => {
    console.log("Image Content Generating... ",)
    const { prompt } = req.body;
    const file = req.file;  // Access the uploaded file details

    if (!file) {
        return res.status(400).json({ error: 'File is required' });
    }

    const filePath = file.path;  // Path to the file saved on the server
    const mimeType = file.mimetype; // Get MIME type of the uploaded file
    const displayName = file.originalname; // Original file name

    try {
        const uploadResult = await fileManager.uploadFile(filePath, {
            mimeType,
            displayName,
        });

        // Generate content based on the uploaded image
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent([
            prompt,
            {
                fileData: {
                    fileUri: uploadResult.file.uri,
                    mimeType: uploadResult.file.mimeType,
                },
            },
        ]);

        res.json({
            message: result.response.text(),
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }

});

router.get('/textgenerate', async (req, res) => {
    console.log("Calling Api for Text Generating...");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const response = await model.generateContent(req.query.text);
        res.json(response.response.text() || { message: "No content Generated" })
    } catch (error) {
        res.json({ message: error });
    }
})

router.post('/saveChat', async (req, res) => {
    console.log("Calling Api to save chat data...");
    const {chat, sessionId, sessionName, userId} = req.body;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const email = user.email; // Extract email from the request parameters

    try {
        let chatSession = await Chats.findOne({ email, sessionId });

        if (!chatSession) {
            // If no chat session exists, create a new one
            chatSession = new Chats({ chat, email, sessionId, sessionName: sessionName, priority: false});
        } else {
            // If chat session exists, add the new message to the chat array
            chatSession.chat = chat;
        }

        // Save the updated or new chat session to the database
        await chatSession.save();

        res.status(200).json({ message: 'Chat data saved successfully' });
    } catch (error) {
        console.error('Error saving chat data:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})

router.post('/renamesession', async (req, res) => {
    console.log("Calling Api to rename chat session...");
    const {sessionId, sessionName, userId} = req.body;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const email = user.email; // Extract email from the request parameters

    try {
        let chatSession = await Chats.findOne({ email, sessionId });

        chatSession.sessionName = sessionName;

        // Save the updated or new chat session to the database
        await chatSession.save();

        res.status(200).json({ message: 'Remaned successfully' });
    } catch (error) {
        console.error('Error saving chat session name:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})

router.post('/updatepriority', async (req, res) => {
    console.log("Calling Api to update chat priority...");
    const {sessionId, priority, userId} = req.body;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const email = user.email; // Extract email from the request parameters

    try {
        let chatSession = await Chats.findOne({ email, sessionId });

        chatSession.priority = priority;

        // Save the updated or new chat session to the database
        await chatSession.save();
        const message = priority ? 'Set as Priority' : 'Remove from Priority'
        res.status(200).json({ message: message });
    } catch (error) {
        console.error('Error saving chat Priority state:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})

router.post('/deletesession', async (req, res) => {
    console.log("Calling Api to delete chat session...");
    const {sessionId, userId} = req.body;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const email = user.email; // Extract email from the request parameters

    try {
        let chatSession = await Chats.findOne({ email, sessionId });

        // Save the updated or new chat session to the database
        await chatSession.deleteOne(chatSession);;

        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting chat session:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})

router.get('/getChat', async (req, res) => {
    console.log("Calling Api for getting chat...");
    const { sessionId, userId } = req.query;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const email = user.email; // Extract email from the request parameters

    try {
        // Find the chat session by the email
        const chatSession = await Chats.findOne({ sessionId, email });

        if (!chatSession) {
            return res.status(200).json({ message: 'No chat session found for this email.' });
        }

        // Respond with the chat data
        res.status(200).json({ chat: chatSession.chat });
    } catch (error) {
        console.error('Error fetching chat data:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.get('/getSession', async (req, res) => {
    console.log("Calling Api to get session...");
    const { userId } = req.query;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const email = user.email; // Extract email from the request parameters

    try {
        // Find the chat session by the email
        const chatSessions = await Chats.find({ email });

        if (chatSessions.length === 0) {
            return res.status(200).json({ message: 'No chat session found for this email.' });
        }

        // Extract sessionId and sessionName from each session
        const sessionData = chatSessions
        .sort((a, b) => b.sessionId - a.sessionId) 
        .sort((a, b) => b.priority - a.priority)
        .map(session => ({
            priority: session.priority,
            sessionId: session.sessionId,
            sessionName: session.sessionName // Provide default name if missing
        }));

        // Respond with the chat data
        res.status(200).json({ sessions: sessionData });
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;