import React, { useEffect, useRef, useState } from 'react';
import * as service from './TextGeneratorService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import "./TextGenerator.css";
import { useParams } from 'react-router-dom';

export default function TextGenerator({ untitledSession, setUntitledSession }) {

    const { sessionId } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [copiedIndex, setCopiedIndex] = useState(null);
    const userId = localStorage.getItem('userId');
    const chatEndRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    useEffect(() => {
        const fetchMessages = async () => {
            const data = await service.getChat(sessionId, userId);
            if (data && data.chat && data.chat.length > 0) {
                const updatedChat = data.chat.map(item => ({
                    ...item,
                    text: item.text.replace(/\*/g, ' ') // Replace all '*' with space
                }));
                setMessages(updatedChat || [])
                return
            }
            setMessages(data.chat || [])
        };
        fetchMessages();
    }, [sessionId, userId]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            });
        }
    }, [messages]);

    const saveChatToDatabase = (data, id, name, userId) => {
        try {
            service.saveChatToDatabase(data, id, name, userId);
        } catch (error) {
            console.error('Error saving chat to database:', error);
        }
    }

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index);
            setTimeout(() => {
                setCopiedIndex(null);
            }, 3000);
        }).catch((err) => {
            console.log("Failed to copy message.");
        });
    };

    const handleSubmit = async (e) => {
        setIsTyping(true);
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
            const sessionName = newMessages[0].text.substring(0, 20);
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
            } finally {
                setIsTyping(false);
            }
        }
    }

    // Function to handle the file upload click
    const handleFileUploadClick = () => {
        document.getElementById('file-upload').click();
    };

    // Function to handle file change
    const handleFileChange = async (e) => {
        setIsTyping(true);
        const file = e.target.files[0];

        if (file) {
            try {
                const upload = await service.uploadImageToChat(sessionId, userId, file)
                setMessages(upload.data)
                const response = await service.getImageContent(sessionId, userId, file);
                setMessages(response.data)
            } catch (error) {
                console.error('Error generating text:', error);
                // setResult('Failed to generate text.');
            } finally {
                setIsTyping(false);
            }
        }
    };

    return (
        <div className="text-container">
            <div className="container my-4 chat-container">
                <div className="chat-box">
                    {messages.length === 0 ? (
                        <p className="text-white">No messages yet.</p>
                    ) : (
                        messages.map((message, index) => (
                            <div key={index} className={`message ${message.sender}`}>
                                {message.sender === 'bot' && (
                                    <><button
                                        className="copy-button"
                                        onClick={() => copyToClipboard(message.text, index)}>
                                        {copiedIndex === index ? "Copied!" : "Copy"}
                                    </button>
                                        <br />
                                    </>
                                )}
                                {message.sender === 'user' && message.text.startsWith('{"contentType":') ? (
                                    (() => {
                                        const parsedMessage = JSON.parse(message.text);
                                        const data = `data:${parsedMessage.contentType};base64,${parsedMessage.data}`;
                                        return <img src={data} style={{ maxWidth: "100%", height: "auto", borderRadius: "15px 15px 0 15px" }} alt="Uploaded content" />;
                                    })()
                                ) : (
                                    <div style={{ whiteSpace: "pre-wrap" }}>{message.text}</div>
                                )}

                            </div>
                        ))
                    )}
                    {isTyping && <div className="typing-indicator">Bot is typing...</div>}
                    {/* This div helps to scroll to the bottom */}
                    <div ref={chatEndRef} />
                </div>

                <form className="input-box" onSubmit={handleSubmit}>
                    <div className="input-with-icon">
                        <button type="button" disabled={messages.length === 0} className="btn upload-btn" onClick={handleFileUploadClick}>
                            <FontAwesomeIcon icon={faFileArrowUp} />
                        </button>
                        <input
                            type="text"
                            className="form-control input-query"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        {/* Hidden file input */}
                        <input
                            type="file"
                            id="file-upload"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>
                    <button type="submit" className="btn submit btn-secondary">
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </form>

            </div>
        </div>
    )
}
