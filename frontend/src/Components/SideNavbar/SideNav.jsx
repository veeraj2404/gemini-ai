import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faPenToSquare, faEllipsis, faUser, faThumbtack, faAngleUp, faAngleDown, faHouse, faIcons, faBrain } from '@fortawesome/free-solid-svg-icons';
import './SideNav.css';
import * as service from './SideNavService';
import { getChat } from '../TextGenerator/TextGeneratorService.js';
import { getUser } from '../Profile/ProfileService.js'
import Profile from '../Profile/Profile.jsx';
import $ from 'jquery';
import { motion } from "framer-motion";

export default function SideNav({ isCreativeFolderOpen, setCreativeFolderOpen, isKnowledgeFolderOpen, setKnowledgeFolderOpen, isOpen, toggleSideNav, onNewSession, imageSessions, setImageSessions, sessions, setSessions, untitledSession, setUntitledSession, imageUntitledSession, setImageUntitledSession }) {

    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const [preview, setPreview] = useState('');
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [isDropdownOpen, setDropdownOpen] = useState(false); // State to manage dropdown visibility
    const [isSessionDropdownOpen, setSessionDropdownOpen] = useState(null); // State to manage dropdown visibility
    const [isImageSessionDropdownOpen, setImageSessionDropdownOpen] = useState(null); // State to manage dropdown visibility
    const dropdownRef = useRef(null);
    const [isModalOpen, setModalOpen] = useState(false); // Controls modal visibility
    const [isProfileOpen, setProfileOpen] = useState(false); // Controls settings visibility
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [newSessionName, setNewSessionName] = useState("");
    const [editingImageSessionId, setEditingImageSessionId] = useState(null);
    const [newImageSessionName, setNewImageSessionName] = useState("");
    const [present, setPresent] = useState(true)
    const [imagePresent, setImagePresent] = useState(true)
    const [selectedSession, setSelectedSession] = useState(null); // Holds session to be deleted

    useEffect(() => {
        const fetchSession = async () => {
            if (token) {
                try {
                    const user = await getUser(userId);
                    if (user.preview) {
                        setPreview(user.preview)
                    }

                    const data = await service.getSession(userId); // Fetch the session data from backend
                    if (!Array.isArray(data) || data.length === 0) {
                        setPresent(false);
                        setUntitledSession(false);
                        return;
                    }
                    const indexedData = data.map((session, index) => ({
                        ...session,
                        originalIndex: index, // Add original index to each session
                        present: true
                    }));
                    setSessions(indexedData);
                } catch (error) {
                    console.error('Error fetching session data:', error);
                }
            }
        };
        const fetchImageSession = async () => {
            if (token) {
                try {
                    const data = await service.getImageSession(userId); // Fetch the session data from backend
                    if (!Array.isArray(data) || data.length === 0) {
                        // console.warn("Session data is empty or invalid.");
                        setImagePresent(false);
                        setImageUntitledSession(false);
                        return;
                    }
                    const indexedData = data.map((session, index) => ({
                        ...session,
                        originalIndex: index, // Add original index to each session
                        present: true
                    }));
                    setImageSessions(indexedData);
                } catch (error) {
                    console.error('Error fetching session data:', error);
                }
            }
        };
        fetchSession();
        fetchImageSession();
    }, [setSessions, setImageSessions, token, userId, isModalOpen, setUntitledSession, setImageUntitledSession]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false); // Close the dropdown
                setSessionDropdownOpen(null)
                setImageSessionDropdownOpen(null)
                setFilteredSessions([])
            }
        };

        if (isDropdownOpen || isSessionDropdownOpen || isImageSessionDropdownOpen || filteredSessions) {
            document.addEventListener('mousedown', handleClickOutside); // Listen for outside clicks
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside); // Cleanup event listener
        };
    }, [isDropdownOpen, isSessionDropdownOpen, isImageSessionDropdownOpen, filteredSessions]);

    const toggleDropdown = () => {
        setDropdownOpen(prev => !prev);
    }

    const resetState = () => {
        setPreview('')
        setFilteredSessions([])
        setDropdownOpen(false)
        setSessionDropdownOpen(null)
        setImageSessionDropdownOpen(null)
        setModalOpen(false)
        setProfileOpen(false)
        setEditingSessionId(null)
        setEditingImageSessionId(null)
        setNewSessionName("")
        setNewImageSessionName("")
        setPresent(true)
        setImagePresent(true)
        setSelectedSession(null)
    }

    const logout = () => {
        localStorage.clear();
        resetState()
        navigate('/loginsignup');
    }

    const loginPage = () => {
        resetState()
        navigate('/loginsignup');
    }

    const homePage = () => {
        if (window.innerWidth <= 768) {
            toggleSideNav()
        }
        navigate('/home');
    }

    const handleProfile = () => {
        setDropdownOpen(false)
        setProfileOpen(true)
    }

    const createNewSession = () => {
        if (location.pathname.startsWith("/textgenerator/")) {

            if (untitledSession) {
                const newSessionId = present ? Math.max(...sessions.map(session => session.sessionId)) + 1 : 1;
                navigate(`/textgenerator/${newSessionId}`);
                onNewSession(newSessionId, present); // Notify the parent to update the current session
                setUntitledSession(false)
                return
            }
        } else if (location.pathname.startsWith("/imagegenerator/")) {

            if (imageUntitledSession) {
                const newSessionId = imagePresent ? Math.max(...imageSessions.map(session => session.imageSessionId)) + 1 : 1;
                navigate(`/imagegenerator/${newSessionId}`);
                onNewSession(newSessionId, imagePresent); // Notify the parent to update the current session
                setImageUntitledSession(false)
                return
            }
        } else if (location.pathname.startsWith("/home")) {
            return
        }
        toast.warning("New Session is already Present")
    };

    const toggleKnowledge = () => {
        if (!location.pathname.startsWith("/textgenerator/")) {
            setKnowledgeFolderOpen((prev) => !prev);
        }
    };

    const toggleCreative = () => {
        if (!location.pathname.startsWith("/imagegenerator/")) {
            setCreativeFolderOpen((prev) => !prev); // Toggle the folder open/close state
        }
    };

    const startEditing = (id, name) => {
        setSessionDropdownOpen(null)
        setEditingSessionId(id);
        setNewSessionName(name || `Chat Session ${id}`);
    };

    const startImageEditing = (id, name) => {
        setImageSessionDropdownOpen(null)
        setEditingImageSessionId(id);
        setNewImageSessionName(name || `Image Session ${id}`);
    };

    const sessionEdit = (id) => {
        setSessionDropdownOpen(prev => (prev === id ? null : id))
    }

    const imageSessionEdit = (id) => {
        setImageSessionDropdownOpen(prev => (prev === id ? null : id))
    }

    const handleRenameSession = async (id) => {
        try {
            const updatedSessions = sessions.map((session) =>
                session.sessionId === id ? { ...session, sessionName: newSessionName } : session
            );
            setSessions(updatedSessions);
            setEditingSessionId(null);

            // Update session name in the backend
            const message = await service.updateSessionName(id, newSessionName, userId);
            toast.success(message, {
                style: {
                    backgroundColor: 'rgb(45, 46, 45)',
                    color: 'white',
                    fontFamily: 'cursive'
                }
            })
        } catch (error) {
            console.error("Failed to update session name:", error);
        }
    };

    const handleRenameImageSession = async (id) => {
        try {
            const updatedSessions = imageSessions.map((session) =>
                session.imageSessionId === id ? { ...session, imageSessionName: newImageSessionName } : session
            );
            setImageSessions(updatedSessions);
            setEditingImageSessionId(null);

            // Update session name in the backend
            const message = await service.updateImageSessionName(id, newImageSessionName, userId);
            toast.success(message, {
                style: {
                    backgroundColor: 'rgb(45, 46, 45)',
                    color: 'white',
                    fontFamily: 'cursive'
                }
            })
        } catch (error) {
            console.error("Failed to update session name:", error);
        }
    };

    const updatePriority = async (id, currentPriority) => {
        try {
            // Toggle priority on the server
            const message = await service.updatePriority(id, !currentPriority, userId);

            // Update local state to reflect the new priority
            const updatedSessions = sessions.map((session) =>
                session.sessionId === id
                    ? { ...session, priority: !currentPriority }
                    : session
            );

            // Sort sessions: pinned sessions first, followed by the rest in their original order
            const sortedSessions = updatedSessions
                .filter((session) => session.priority) // Pinned sessions
                .concat(
                    updatedSessions
                        .filter((session) => !session.priority) // Unpinned sessions
                        .sort((a, b) => a.originalIndex - b.originalIndex) // Sort by original index
                );

            setSessions(sortedSessions); // Update the state with the sorted sessions
            setSessionDropdownOpen(null); // Close dropdown menu
            toast.info(message, {
                style: {
                    backgroundColor: 'rgb(45, 46, 45)',
                    color: 'white',
                    fontFamily: 'cursive'
                }
            })
        } catch (error) {
            console.error("Failed to update priority:", error);
        }
    };

    const updateImagePriority = async (id, currentPriority) => {
        try {
            // Toggle priority on the server
            const message = await service.updateImagePriority(id, !currentPriority, userId);

            // Update local state to reflect the new priority
            const updatedSessions = imageSessions.map((session) =>
                session.imageSessionId === id
                    ? { ...session, priority: !currentPriority }
                    : session
            );

            // Sort sessions: pinned sessions first, followed by the rest in their original order
            const sortedSessions = updatedSessions
                .filter((session) => session.priority) // Pinned sessions
                .concat(
                    updatedSessions
                        .filter((session) => !session.priority) // Unpinned sessions
                        .sort((a, b) => a.originalIndex - b.originalIndex) // Sort by original index
                );

            setImageSessions(sortedSessions); // Update the state with the sorted sessions
            setImageSessionDropdownOpen(null); // Close dropdown menu
            toast.info(message, {
                style: {
                    backgroundColor: 'rgb(45, 46, 45)',
                    color: 'white',
                    fontFamily: 'cursive'
                }
            })
        } catch (error) {
            console.error("Failed to update priority:", error);
        }
    };

    const handleDeleteClick = (id) => {
        setSelectedSession(id);
        setModalOpen(true); // Open the modal
    };

    const confirmDeleteSession = async (selectedSession) => {
        var message
        if (location.pathname.startsWith("/textgenerator/")) {
            message = await service.deleteSession(selectedSession, userId)
        }
        if (location.pathname.startsWith("/imagegenerator/")) {
            message = await service.deleteImageSession(selectedSession, userId)
        }
        setModalOpen(false); // Close the modal
        toast.error(message.message, {
            style: {
                backgroundColor: 'rgb(45, 46, 45)',
                color: 'white',
                fontFamily: 'cursive'
            }
        })
        window.location.reload();
    };

    const searchBar = (e) => {
        const name = e.target.value;
        if (location.pathname.startsWith("/textgenerator/")) {
            setFilteredSessions(sessions.filter(session =>
                session.sessionName.toLowerCase().includes(name.toLowerCase())
            ));
        }
        if (location.pathname.startsWith("/imagegenerator/")) {
            setFilteredSessions(imageSessions.filter(session =>
                session.imageSessionName.toLowerCase().includes(name.toLowerCase())
            ));
        }
        if (name === '') {
            setFilteredSessions([])
        }
    }

    const navigateFromSearchBar = (id) => {
        if (location.pathname.startsWith("/textgenerator/")) {
            navigate(`/textgenerator/${id}`);
        }
        if (location.pathname.startsWith("/imagegenerator/")) {
            navigate(`/imagegenerator/${id}`);
        }
        setFilteredSessions([])
        $('#searchBar').val('');
    }

    const downloadChatPdf = async (id, name) => {
        try {
            const chat = await getChat(id, userId)
            const response = await service.downloadChatPdf(name, chat.history);
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${name}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        } finally {
            setSessionDropdownOpen(null)
        }
    }

    const container = (delay) => ({
        hidden: { x: -100, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.5, delay: delay }
        }
    })

    return (
        <>
            <motion.div variants={container(0)}
                initial="hidden"
                animate="visible" className={`side-nav-container ${isOpen ? 'bgpresent' : 'bgChange'}`}>
                <div className={`main-content ${isOpen ? 'shifted' : 'unshifted'}`}>
                    <button className={`openbtn ${isOpen ? '' : 'bgChange'}`} onClick={toggleSideNav}>
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                </div>

                {
                    token ? (
                        <>
                            <div className="profile-container">
                                <button className={`openedit ${isOpen ? '' : 'bgChange'}`} onClick={createNewSession}>
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </button>
                                <button className={`openprofile ${isOpen ? '' : 'bgChange'}`} onClick={toggleDropdown}>
                                    {
                                        preview === '' ?
                                            <FontAwesomeIcon icon={faUser} /> :
                                            <img src={preview} style={{
                                                width: '24px',
                                                height: '24px',
                                                objectFit: 'cover',
                                                marginLeft: '-7px',
                                                marginBottom: '-5px'
                                            }} className="rounded float-end" alt="Profile" />
                                    }
                                </button>
                                {isDropdownOpen && ( // Conditionally render the dropdown
                                    <div className="dropdown-menu show" ref={dropdownRef}>
                                        <ul>
                                            <li className="logout-button" onClick={handleProfile}>Profile</li>
                                            <li className="logout-button" onClick={logout}>Logout</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <nav className={`sidenav my-5 ${isOpen ? 'open' : ''}`}>
                                <div className="search-bar mb-4">
                                    <input onChange={(e) => searchBar(e)} type="text" id='searchBar' className="form-control" placeholder="Search Session" aria-label="session"
                                        style={{ paddingLeft: "12px" }} />
                                </div>

                                {filteredSessions.length > 0 && (
                                    <div className="search-bar-menu show" ref={dropdownRef}>
                                        <ul>
                                            {filteredSessions.map(session => (
                                                <li onClick={() => {
                                                    if (window.innerWidth <= 768) {
                                                        toggleSideNav()
                                                    }
                                                    navigateFromSearchBar(session.sessionId ? session.sessionId : session.imageSessionId)
                                                }} key={session.sessionId ? session.sessionId : session.imageSessionId}>
                                                    {session.sessionName ? session.sessionName : session.imageSessionName}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="session-container">
                                    <span>Klaus-AI</span>
                                    <div className="section">
                                        <div className="home" onClick={homePage}>
                                            <div>
                                                <FontAwesomeIcon icon={faHouse} style={{ marginRight: "3px" }} />
                                                <span>Home</span>
                                            </div>
                                        </div>

                                        {
                                            token && (
                                                <>
                                                    <div className="folder">
                                                        <div className="folder-head" onClick={toggleKnowledge}>
                                                            <div>
                                                                <FontAwesomeIcon icon={faBrain} style={{ marginRight: "3px" }} />
                                                                <span>Knowledge</span>
                                                            </div>
                                                            <div>
                                                                <FontAwesomeIcon icon={isKnowledgeFolderOpen ? faAngleUp : faAngleDown} />
                                                            </div>
                                                        </div>
                                                        {
                                                            isKnowledgeFolderOpen &&
                                                            <div className="folder-content">
                                                                {sessions.slice().map((session) => (
                                                                    <NavLink to={`/textgenerator/${session.sessionId}`}
                                                                        onClick={() => window.innerWidth <= 768 && toggleSideNav()}
                                                                        className={({ isActive }) => `session-item ${isActive ? "active" : ""}`} key={session.sessionId}
                                                                    >
                                                                        {editingSessionId === session.sessionId ? (
                                                                            <input type="text" value={newSessionName} className="session-rename-input" autoFocus
                                                                                onChange={(e) => setNewSessionName(e.target.value)}
                                                                                onBlur={() => handleRenameSession(session.sessionId)}
                                                                                onKeyDown={(e) => e.key === "Enter" && handleRenameSession(session.sessionId)}
                                                                            />
                                                                        ) : (
                                                                            <span onDoubleClick={() => startEditing(session.sessionId, session.sessionName)}>
                                                                                {session.priority && <FontAwesomeIcon icon={faThumbtack} style={{ marginRight: "3px", color: "red" }} />}
                                                                                {session.sessionName}
                                                                            </span>
                                                                        )}
                                                                        {present && session.present && (
                                                                            <div className="session-icon">
                                                                                <FontAwesomeIcon icon={faEllipsis} onClick={() => sessionEdit(session.sessionId)} />
                                                                                {isSessionDropdownOpen === session.sessionId &&
                                                                                    <div className="action-menu" ref={dropdownRef}>
                                                                                        <ul>
                                                                                            <li onClick={() => updatePriority(session.sessionId, session.priority)}>
                                                                                                {session.priority ? "Unpin" : "Pin"}
                                                                                            </li>
                                                                                            <li onClick={() => startEditing(session.sessionId, session.sessionName)}>
                                                                                                Rename
                                                                                            </li>
                                                                                            <li onClick={() => handleDeleteClick(session.sessionId)}>
                                                                                                Delete
                                                                                            </li>
                                                                                            <li onClick={() => downloadChatPdf(session.sessionId, session.sessionName)}>
                                                                                                Export
                                                                                            </li>
                                                                                        </ul>
                                                                                    </div>
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </NavLink>
                                                                ))}
                                                            </div>
                                                        }
                                                    </div>
                                                    <div className="folder">
                                                        <div className="folder-head" onClick={toggleCreative}>
                                                            <div>
                                                                <FontAwesomeIcon icon={faIcons} style={{ marginRight: "3px" }} />
                                                                <span>Creative</span>
                                                            </div>
                                                            <div>
                                                                <FontAwesomeIcon icon={isCreativeFolderOpen ? faAngleUp : faAngleDown} />
                                                            </div>
                                                        </div>
                                                        {
                                                            isCreativeFolderOpen &&
                                                            <div className="folder-content">
                                                                {imageSessions.slice().map((session) => (
                                                                    <NavLink to={`/imagegenerator/${session.imageSessionId}`}
                                                                        onClick={() => window.innerWidth <= 768 && toggleSideNav()}
                                                                        className={({ isActive }) => `session-item ${isActive ? "active" : ""}`} key={session.imageSessionId}
                                                                    >
                                                                        {editingImageSessionId === session.imageSessionId ? (
                                                                            <input type="text" value={newImageSessionName} className="session-rename-input" autoFocus
                                                                                onChange={(e) => setNewImageSessionName(e.target.value)}
                                                                                onBlur={() => handleRenameImageSession(session.imageSessionId)}
                                                                                onKeyDown={(e) => e.key === "Enter" && handleRenameImageSession(session.imageSessionId)}
                                                                            />
                                                                        ) : (
                                                                            <span onDoubleClick={() => startImageEditing(session.imageSessionId, session.imageSessionName)}>
                                                                                {session.priority && <FontAwesomeIcon icon={faThumbtack} style={{ marginRight: "3px", color: "red" }} />}
                                                                                {session.imageSessionName}
                                                                            </span>
                                                                        )}
                                                                        {imagePresent && session.present && (
                                                                            <div className="session-icon">
                                                                                <FontAwesomeIcon icon={faEllipsis} onClick={() => imageSessionEdit(session.imageSessionId)} />
                                                                                {isImageSessionDropdownOpen === session.imageSessionId &&
                                                                                    <div className="action-menu" ref={dropdownRef}>
                                                                                        <ul>
                                                                                            <li onClick={() => updateImagePriority(session.imageSessionId, session.priority)}>
                                                                                                {session.priority ? "Unpin" : "Pin"}
                                                                                            </li>
                                                                                            <li onClick={() => startImageEditing(session.imageSessionId, session.imageSessionName)}>
                                                                                                Rename
                                                                                            </li>
                                                                                            <li onClick={() => handleDeleteClick(session.imageSessionId)}>
                                                                                                Delete
                                                                                            </li>
                                                                                        </ul>
                                                                                    </div>
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </NavLink>
                                                                ))}
                                                            </div>
                                                        }
                                                    </div>
                                                </>
                                            )
                                        }
                                    </div>
                                </div>
                            </nav>
                        </>
                    ) : (
                        <>
                            <div className="profile-container" style={{ marginLeft: "-47.5px" }}>
                                <button className={`openprofile ${isOpen ? '' : 'bgChange'}`} onClick={loginPage}>
                                    <FontAwesomeIcon icon={faUser} />
                                </button>
                            </div>
                            <nav className={`sidenav my-5 ${isOpen ? 'open' : ''}`}>
                                <span><h6 className='chatSession'>Klaus-AI</h6></span>

                                <div className="search-bar">
                                    <button onClick={homePage} className="homepage">
                                        <FontAwesomeIcon icon={faHouse} style={{ marginRight: "3px" }} />
                                        Home
                                    </button>
                                </div>
                            </nav>
                        </>
                    )
                }
            </motion.div>

            {/* Bootstrap Modal */}
            {isModalOpen && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" >
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header header">
                                <h5 className="modal-title">Confirm Deletion</h5>

                            </div>
                            <div className="modal-body body-content">
                                <p>Are you sure you want to delete this session?</p>
                            </div>
                            <div className="modal-footer content-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setModalOpen(false)}
                                    style={{ backgroundColor: "" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => confirmDeleteSession(selectedSession)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {isProfileOpen && (
                <Profile setProfileOpen={setProfileOpen} updateProfile={setPreview} />
            )}


            {/* ToastContainer to display toasts */}
            <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
        </>
    );
}
