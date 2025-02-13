const express = require("express");
const router = express.Router();
const multer = require('multer');
const fontkit = require('fontkit');
const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');
const { GoogleAIFileManager } = require('@google/generative-ai/server')
const { GoogleGenerativeAI } = require('@google/generative-ai');

//import models
const Chats = require('../models/Chats')
const ImageChats = require('../models/ImageChats')
const User = require('../models/User');
const Image = require('../models/Image');

// Initialize Google AI File Manager
const fileManager = new GoogleAIFileManager(process.env.API_KEY); // Adjust if necessary
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Set up multer for file upload
const upload = multer({ dest: 'uploads/' }); // Files will be saved to the "uploads" directory
const uploaded = multer({ storage: multer.memoryStorage() })
// API endpoint for generating content

router.post('/imagecontent', upload.single('file'), async (req, res) => {
    const file = req.file;  // Access the uploaded file details
    const { imageSessionId, userId, text } = req.body;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const email = user.email;

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
            text === '' ?  "Tell me about this image." : text,
            {
                fileData: {
                    fileUri: uploadResult.file.uri,
                    mimeType: uploadResult.file.mimeType,
                },
            },
        ]);
        let ImageChatsSession = await ImageChats.findOne({ email, imageSessionId });
        const history = [
            ...ImageChatsSession.history,
            { parts: [{ text: result.response.text() }], role: 'model' }
        ];
        ImageChatsSession.history = history;
        await ImageChatsSession.save();
        res.json({
            message: result.response.text(),
            data: history
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }

});

router.post('/upload', uploaded.single('file'), async (req, res) => {

    const { imageSessionId, userId, text } = req.body;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const email = user.email;

    try {
        const image = new Image({
            contentType: req.file.mimetype,
            name: req.file.originalname,
            data: req.file.buffer.toString('base64'),
        });
        let ImageChatsSession = await ImageChats.findOne({ email, imageSessionId });

        if (!ImageChatsSession) {
            // If no chat session exists, create a new one
            var history = [
                { parts: [{ image, text }], role: 'user' }
            ];
            ImageChatsSession = new ImageChats({ history, email, imageSessionId, imageSessionName: req.file.originalname, priority: false });
        } else {
            // If chat session exists, add the new message to the chat array
            var history = [
                ...ImageChatsSession.history,
                { parts: [{ image, text }], role: 'user' }
            ];
        }
        ImageChatsSession.history = history;
        await ImageChatsSession.save();
        res.json({ message: 'Image uploaded successfully!', data: history });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

router.get('/textgenerate', async (req, res) => {

    const {history, text} = req.query;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({ history });

    try {
        let result = await chat.sendMessage(text);
        
        res.json(result.response.text() || { message: "No content Generated" })
    } catch (error) {
        res.json({ message: error });
    }
})

router.post('/saveChat', async (req, res) => {
    
    const { history, sessionId, sessionName, userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const email = user.email; // Extract email from the request parameters

    try {
        let chatSession = await Chats.findOne({ email, sessionId });

        if (!chatSession) {
            // If no chat session exists, create a new one
            chatSession = new Chats({ history, email, sessionId, sessionName: sessionName, priority: false });
        } else {
            // If chat session exists, add the new message to the chat array
            chatSession.history = history;
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
    
    const { sessionId, sessionName, userId } = req.body;
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

router.post('/renameimagesession', async (req, res) => {
    
    const { imageSessionId, imageSessionName, userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const email = user.email; // Extract email from the request parameters

    try {
        let imageChatSession = await ImageChats.findOne({ email, imageSessionId });

        imageChatSession.imageSessionName = imageSessionName;

        // Save the updated or new chat session to the database
        await imageChatSession.save();

        res.status(200).json({ message: 'Remaned successfully' });
    } catch (error) {
        console.error('Error saving chat session name:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})

router.post('/updatepriority', async (req, res) => {
    
    const { sessionId, priority, userId } = req.body;
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

router.post('/updateimagepriority', async (req, res) => {
    
    const { imageSessionId, priority, userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const email = user.email; // Extract email from the request parameters

    try {
        let imageChatSession = await ImageChats.findOne({ email, imageSessionId });

        imageChatSession.priority = priority;

        // Save the updated or new chat session to the database
        await imageChatSession.save();
        const message = priority ? 'Set as Priority' : 'Remove from Priority'
        res.status(200).json({ message: message });
    } catch (error) {
        console.error('Error saving chat Priority state:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})

router.post('/deletesession', async (req, res) => {
    
    const { sessionId, userId } = req.body;
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

router.post('/deleteimagesession', async (req, res) => {
    
    const { imageSessionId, userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const email = user.email; // Extract email from the request parameters

    try {
        let imageChatSession = await ImageChats.findOne({ email, imageSessionId });

        // Save the updated or new chat session to the database
        await imageChatSession.deleteOne(imageChatSession);;

        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting chat session:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})

router.get('/getChat', async (req, res) => {
    
    const { sessionId, userId } = req.query;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const email = user.email; // Extract email from the request parameters

    try {
        // Find the chat session by the email
        const chatSession = await Chats.findOne({ sessionId, email }, { 'history._id': 0, 'history.parts._id': 0 });

        if (!chatSession) {
            return res.status(200).json({ message: 'No chat session found for this email.' });
        }

        // Respond with the chat data
        res.status(200).json({ history: chatSession.history });
    } catch (error) {
        console.error('Error fetching chat data:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.get('/getImageChat', async (req, res) => {
    
    const { imageSessionId, userId } = req.query;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const email = user.email; // Extract email from the request parameters

    try {
        // Find the chat session by the email
        const ImageChatsSession = await ImageChats.findOne({ imageSessionId, email });

        if (!ImageChatsSession) {
            return res.status(200).json({ message: 'No chat session found for this email.' });
        }

        // Respond with the chat data
        res.status(200).json({ history: ImageChatsSession.history });
    } catch (error) {
        console.error('Error fetching chat data:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.get('/getSession', async (req, res) => {
    
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

router.get('/getImageSession', async (req, res) => {
    
    const { userId } = req.query;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const email = user.email; // Extract email from the request parameters

    try {
        // Find the chat session by the email
        const ImageChatSessions = await ImageChats.find({ email });

        if (ImageChatSessions.length === 0) {
            return res.status(200).json({ message: 'No chat session found for this email.' });
        }

        // Extract sessionId and sessionName from each session
        const sessionData = ImageChatSessions
            .sort((a, b) => b.imageSessionId - a.imageSessionId)
            .sort((a, b) => b.priority - a.priority)
            .map(session => ({
                priority: session.priority,
                imageSessionId: session.imageSessionId,
                imageSessionName: session.imageSessionName // Provide default name if missing
            }));

        // Respond with the chat data
        res.status(200).json({ sessions: sessionData });
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

router.get('/generate-pdf', async (req, res) => {
    
    try {
        const { sessionName, history } = req.query;

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);

        // Embed a custom font
        const fontBytes = fs.readFileSync('fonts/NotoSans-Regular.ttf');
        const customFont = await pdfDoc.embedFont(fontBytes);

        let page = pdfDoc.addPage([600, 800]);
        const { width, height } = page.getSize();

        // Add the title
        const title = sessionName;
        page.drawText(`Session Name: ${title}`, {
            x: 50,
            y: height - 50,
            size: 16,
            font: customFont,
            color: rgb(0, 0, 1),
        });

        // Add a horizontal line
        page.drawLine({
            start: { x: 50, y: height - 70 },
            end: { x: width - 50, y: height - 70 },
            thickness: 1,
            color: rgb(0, 0, 0),
        });

        // Add chat messages
        let yPosition = height - 100;
        const lineHeight = 20;
        const margin = 50;

        // Function to wrap text with a max width and handle line breaks (`\n`)
        const wrapTextWithLineBreaks = (text, maxWidth) => {
            const paragraphs = text.split('\n'); // Split by line breaks
            const wrappedLines = [];

            paragraphs.forEach((paragraph) => {
                const words = paragraph.split(' '); // Split paragraph into words
                let currentLine = '';

                words.forEach((word) => {
                    const testLine = currentLine + word + ' ';
                    const testWidth = customFont.widthOfTextAtSize(testLine, 12);
                    if (testWidth > maxWidth && currentLine !== '') {
                        wrappedLines.push(currentLine.trim());
                        currentLine = word + ' ';
                    } else {
                        currentLine = testLine;
                    }
                });

                if (currentLine) {
                    wrappedLines.push(currentLine.trim());
                }
            });

            return wrappedLines;
        };

        // Function to add chat message with sender name and dynamic text styling
        const addMessage = (role, text, isBot = false) => {
            const senderText = `${role}: `;
            const lines = wrapTextWithLineBreaks(senderText + text, width - margin * 2);

            lines.forEach((line) => {
                if (yPosition < 50) {
                    page = pdfDoc.addPage([600, 800]);
                    yPosition = height - 50;
                }

                // Apply different colors for user and bot
                const senderColor = isBot ? rgb(0, 0, 1) : rgb(0, 0, 0); // Blue for bot, black for user
                page.drawText(line, {
                    x: margin,
                    y: yPosition,
                    size: 12,
                    font: customFont,
                    color: senderColor,
                });

                yPosition -= lineHeight;
            });
        };

        // Loop through the chat and add messages
        history.forEach(({ role, parts }) => {
            const isModel = role.toLowerCase() === 'model'; // Check if it's a bot message
            addMessage(role, parts[0].text, isModel);
        });

        // Save and send the PDF
        const pdfBytes = await pdfDoc.save();
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=${sessionName}.pdf`,
        });
        res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Error generating PDF' });
    }
});


module.exports = router;