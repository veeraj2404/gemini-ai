import React, { useEffect, useState } from 'react';
import * as service from './TextGeneratorService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import "./TextGenerator.css";
import { useParams } from 'react-router-dom';

export default function TextGenerator({ untitledSession, setUntitledSession }) {

    const { sessionId } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchMessages = async () => {
            const data = await service.getChat(sessionId, userId);
            const updatedChat = data.chat.map(item => ({
                ...item,
                text: item.text.replace(/\*/g, ' ') // Replace all '*' with space
            }));
            setMessages(updatedChat || [])
        };
        fetchMessages();
    }, [sessionId, userId]);

    const saveChatToDatabase = (data, id, name, userId) => {
        try {
            service.saveChatToDatabase(data, id, name, userId);
        } catch (error) {
            console.error('Error saving chat to database:', error);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!untitledSession) {
            setUntitledSession(true)
        }
        if (input.trim()) {
            const newMessages = [
                ...messages,
                { text: input, sender: 'user' },
            ];

            setMessages(newMessages);
            const sessionName = newMessages[0].text;
            saveChatToDatabase(newMessages, sessionId, sessionName, userId);
            setInput('');

            try {
                const response = await service.getTextGeneration(input);
                const updatedMessages = [
                    ...newMessages,
                    { text: response, sender: 'bot' }
                ];
                const updatedChat = updatedMessages.map(item => ({
                    ...item,
                    text: item.text.replace(/\*/g, ' ') // Replace all '*' with space
                }));
                setMessages(updatedChat);
                saveChatToDatabase(updatedChat, sessionId, sessionName, userId);
            } catch (error) {
                console.error('Error generating text:', error);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: 'Failed to generate text.', sender: 'bot' }
                ]);
            }
        }
    }

    return (
        <div className="text-container">
            <div className="container my-4 chat-container">
                <div className="chat-box">
                    {messages.length === 0 ? (
                        <p className="text-white">No messages yet.</p>
                    ) : (
                        messages.map((message, index) => (
                            <div key={index} className={`message ${message.sender}`}>
                                {message.text}
                            </div>
                        ))
                    )}
                </div>

                <form className="input-box" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-secondary">
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </form>
            </div>
        </div>
    )
}
