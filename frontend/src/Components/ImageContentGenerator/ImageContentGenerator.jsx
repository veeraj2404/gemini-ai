import React, { useEffect, useRef, useState } from 'react';
import * as service from './ImageContentGeneratorService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faFileArrowUp, faXmark } from '@fortawesome/free-solid-svg-icons';
import "./ImageContentGenerator.css";
import { useParams } from 'react-router-dom';

export default function ImageContentGenerator() {

    const { imageSessionId } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [file, setFile] = useState('');
    const [preview, setPreview] = useState('');
    const [copiedIndex, setCopiedIndex] = useState(null);
    const userId = localStorage.getItem('userId');
    const chatEndRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    useEffect(() => {
        const fetchMessages = async () => {
            localStorage.setItem('path', '/imagegenerator/');
            const data = await service.getImageChat(imageSessionId, userId);
            setMessages(data.history || [])
        };
        fetchMessages();
    }, [imageSessionId, userId]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            });
        }
    }, [messages]);

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
        setFile('')
        setPreview('')
        setInput('')
        setIsTyping(true);
        e.preventDefault();

        if (file) {
            try {
                const upload = await service.uploadImageToChat(imageSessionId, userId, file, input.trim())
                setMessages(upload.data)
                const response = await service.getImageContent(imageSessionId, userId, file, input.trim());
                setMessages(response.data)
            } catch (error) {
                console.error('Error generating text:', error);
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
        const file = e.target.files[0];
        setFile(file)
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target.result); // Set the image preview
            };
            reader.readAsDataURL(file); // Convert the file to a data URL
        }
    };

    const cancelPreview = () => {
        setFile('')
        setPreview('')
    }

    return (
        <div className="text-container">
            <div className="container my-4 chat-container">
                <div className="chat-box">
                    {messages.length === 0 ? (
                        <p className="text-white">No Image Uploaded yet.</p>
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
                                        <div style={{ whiteSpace: "pre-wrap" }}>{message.parts[0].text}</div>
                                    </>
                                )}
                                {message.role === 'user' &&
                                    (() => {
                                        const parsedMessage = message.parts[0].image
                                        const data = `data:${parsedMessage.contentType};base64,${parsedMessage.data}`;
                                        return (
                                            <>
                                                <img src={data} style={{ maxWidth: "100%", height: "auto", borderRadius: "15px 15px 0 15px" }} alt="Uploaded content" />
                                                <div style={{ whiteSpace: "pre-wrap" }}>{message.parts[0].text}</div>
                                            </>
                                        )
                                    })()
                                }
                            </div>
                        ))
                    )}
                    {isTyping && <div className="typing-indicator">Klaus is typing...</div>}
                    {/* This div helps to scroll to the bottom */}
                    <div ref={chatEndRef} />
                </div>

                {preview &&
                    (
                        <div className='image-block'>
                            <img className="image-preview" src={preview} alt="Uploaded content" />
                            <FontAwesomeIcon onClick={cancelPreview} className='xmark' icon={faXmark} />
                        </div>
                    )}
                <form className="input-box" onSubmit={handleSubmit}>
                    <div className="input-with-icon">
                        <button type="button" className="btn upload-btn" onClick={handleFileUploadClick}>
                            <FontAwesomeIcon icon={faFileArrowUp} />
                        </button>
                        <input
                            type="text"
                            className="form-control input-query input-query2"
                            placeholder="Type your message..."
                            value={input}
                            id="prompt"
                            name="inputvalue"
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
                    <button type="submit" disabled={file ? false : true} className="btn submit btn-secondary">
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </form>

            </div>
        </div>
    )
}
