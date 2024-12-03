import React, { useEffect, useRef, useState } from 'react';
import * as service from './TextGeneratorService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import "./TextGenerator.css";
import { useParams } from 'react-router-dom';

export default function TextGenerator({ untitledSession, setUntitledSession }) {

    const token = localStorage.getItem('token');

    const { sessionId } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [copiedIndex, setCopiedIndex] = useState(null);
    const userId = localStorage.getItem('userId');
    const chatEndRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        const fetchMessages = async () => {
            if (token) {
                localStorage.setItem('path', '/textgenerator/');
                const data = await service.getChat(sessionId, userId);
                setMessages(data.history || [])
            }
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
        if (token && !untitledSession) {
            setUntitledSession(true)
        }
        if (input.trim()) {
            const newMessages = [
                ...messages,
                { parts: [{ text: input }], role: 'user' },
            ];

            const history = [...messages];

            setMessages(newMessages);
            const sessionName = newMessages[0].parts[0].text.substring(0, 20);
            if (token) {
                saveChatToDatabase(newMessages, sessionId, sessionName, userId);
            }
            setInput('');

            try {
                const response = await service.getTextGeneration(history, input);
                const result = response.replace(/\*/g, ' ');
                const updatedMessages = [
                    ...newMessages,
                    { parts: [{ text: result }], role: 'model' }
                ];
                setMessages(updatedMessages);
                if (token) {
                    saveChatToDatabase(updatedMessages, sessionId, sessionName, userId);
                }
            } catch (error) {
                console.error('Error generating text:', error);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { parts: [{ text: 'Failed to generate text.' }], role: 'model' }
                ]);
            } finally {
                setIsTyping(false);
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
                            <div key={index} className={`message ${message.role}`}>
                                {message.role === 'model' && (
                                    <><button
                                        className="copy-button"
                                        onClick={() => copyToClipboard(message.parts[0].text, index)}>
                                        {copiedIndex === index ? "Copied!" : "Copy"}
                                    </button>
                                        <br />
                                    </>
                                )}
                                {
                                    <div style={{ whiteSpace: "pre-wrap" }}>{message.parts[0].text}</div>
                                }

                            </div>
                        ))
                    )}
                    {isTyping && <div className="typing-indicator">Klaus is typing...</div>}
                    {/* This div helps to scroll to the bottom */}
                    <div ref={chatEndRef} />
                </div>

                <form className="input-box" onSubmit={handleSubmit}>
                    <div className="input-with-icon">
                        <input
                            type="text"
                            className="form-control input-query"
                            placeholder="Type your message..."
                            value={input}
                            id="prompt"
                            name="inputvalue"
                            onChange={(e) => setInput(e.target.value)}
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
