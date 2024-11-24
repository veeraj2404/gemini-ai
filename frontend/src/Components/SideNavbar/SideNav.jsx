import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faPenToSquare, faEllipsis, faUser, faThumbtack, faAngleUp, faAngleDown, faMessage, faPhotoFilm, faHouse } from '@fortawesome/free-solid-svg-icons';
import './SideNav.css';
import * as service from './SideNavService';
import { getChat } from '../TextGenerator/TextGeneratorService.js';
import { getUser } from '../Profile/ProfileService.js'
import Profile from '../Profile/Profile.jsx';
import $ from 'jquery';

export default function SideNav({ isOpen, toggleSideNav, onNewSession, sessions, setSessions, untitledSession, setUntitledSession }) {

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const [isKnowledgeFolderOpen, setKnowledgeFolderOpen] = useState(true); // State to control knowledge folder collapse
    const [isCreativeFolderOpen, setCreativeFolderOpen] = useState(false); // State to control creative folder collapse
    const [preview, setPreview] = useState('');
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [isDropdownOpen, setDropdownOpen] = useState(false); // State to manage dropdown visibility
    const [isSessionDropdownOpen, setSessionDropdownOpen] = useState(null); // State to manage dropdown visibility
    const dropdownRef = useRef(null);
    const [isModalOpen, setModalOpen] = useState(false); // Controls modal visibility
    const [isProfileOpen, setProfileOpen] = useState(false); // Controls settings visibility
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [newSessionName, setNewSessionName] = useState("");
    const [present, setPresent] = useState(true)
    const [selectedSession, setSelectedSession] = useState(null); // Holds session to be deleted

    useEffect(() => {
        const fetchSession = async () => {
            if (token) {
                try {
                    const data = await service.getSession(userId); // Fetch the session data from backend

                    if (data.length === 0) {
                        setPresent(false)
                        setUntitledSession(false)
                    }
                    const indexedData = data.map((session, index) => ({
                        ...session,
                        originalIndex: index, // Add original index to each session
                        present: true
                    }));
                    setSessions(indexedData || []);

                    const user = await getUser(userId);
                    if (user.preview) {
                        setPreview(user.preview)
                    }

                } catch (error) {
                    console.error('Error fetching session data:', error);
                }
            }
        };
        fetchSession();
    }, [setSessions, token, userId, isModalOpen, setUntitledSession]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false); // Close the dropdown
                setSessionDropdownOpen(null)
                setFilteredSessions([])
            }
        };

        if (isDropdownOpen || isSessionDropdownOpen || filteredSessions) {
            document.addEventListener('mousedown', handleClickOutside); // Listen for outside clicks
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside); // Cleanup event listener
        };
    }, [isDropdownOpen, isSessionDropdownOpen, filteredSessions]);

    const toggleDropdown = () => {
        setDropdownOpen(prev => !prev);
    }

    const resetState = () => {
        setPreview('')
        setFilteredSessions([])
        setDropdownOpen(false)
        setSessionDropdownOpen(null)
        setModalOpen(false)
        setProfileOpen(false)
        setEditingSessionId(null)
        setNewSessionName("")
        setPresent(true)
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
        resetState()
        navigate('/');
    }

    const createNewSession = () => {
        if (untitledSession) {
            let newSessionId = present ? Math.max(...sessions.map(session => session.sessionId)) + 1 : 1;
            navigate(`/textgenerator/${newSessionId}`);
            onNewSession(newSessionId, present); // Notify the parent to update the current session
            setUntitledSession(false)
            return
        }
        toast.warning("New Session is already Present")
    };

    const toggleKnowledge = () => {
        setKnowledgeFolderOpen((prev) => !prev); // Toggle the folder open/close state
    };

    const toggleCreative = () => {
        setCreativeFolderOpen((prev) => !prev); // Toggle the folder open/close state
    };

    const startEditing = (sessionId, currentName) => {
        setSessionDropdownOpen(null)
        setEditingSessionId(sessionId);
        setNewSessionName(currentName || `Chat Session ${sessionId}`);
    };

    const handleRenameSession = async (sessionId) => {
        try {
            const updatedSessions = sessions.map((session) =>
                session.sessionId === sessionId ? { ...session, sessionName: newSessionName } : session
            );
            setSessions(updatedSessions);
            setEditingSessionId(null);

            // Update session name in the backend
            const message = await service.updateSessionName(sessionId, newSessionName, userId);
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

    const sessionEdit = (sessionId) => {
        setSessionDropdownOpen(prev => (prev === sessionId ? null : sessionId))
    }

    const handleProfile = () => {
        setDropdownOpen(false)
        setProfileOpen(true)
    }

    const handleDeleteClick = (sessionId) => {
        setSelectedSession(sessionId);
        setModalOpen(true); // Open the modal
    };


    const confirmDeleteSession = async (selectedSession) => {
        const message = await service.deleteSession(selectedSession, userId)
        if (selectedSession === 1 && sessions.length === 1) {
            createNewSession()
        }
        setModalOpen(false); // Close the modal
        toast.error(message, {
            style: {
                backgroundColor: 'rgb(45, 46, 45)',
                color: 'white',
                fontFamily: 'cursive'
            }
        })
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

    const searchBar = (e) => {
        const name = e.target.value;
        setFilteredSessions(sessions.filter(session =>
            session.sessionName.toLowerCase().includes(name.toLowerCase())
        ));
        if (name === '') {
            setFilteredSessions([])
        }
    }

    const navigateFromSearchBar = (id) => {
        navigate(`/textgenerator/${id}`);
        setFilteredSessions([])
        $('#searchBar').val('');
    }

    const downloadChatPdf = async (id, name) => {
        try {
            const chat = await getChat(id, userId)
            const response = await service.downloadChatPdf(name, chat.chat);
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

    return (
        <>
            <div className={`side-nav-container ${isOpen ? '' : 'bgChange'}`}>
                <div className={`main-content ${isOpen ? 'shifted' : 'unshifted'}`}>
                    <button className={`openbtn ${isOpen ? '' : 'bgChange'}`} onClick={toggleSideNav}>
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    {
                        token ? (
                            <div className="profile-container" ref={dropdownRef}>
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
                                    <div className="dropdown-menu show">
                                        <ul>
                                            <li className="logout-button" onClick={handleProfile}>Profile</li>
                                            <li className="logout-button" onClick={logout}>Logout</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) :
                            (
                                <div className="profile-container" style={{ marginLeft: "-47.5px" }}>
                                    <button className={`openprofile ${isOpen ? '' : 'bgChange'}`} onClick={loginPage}>
                                        <FontAwesomeIcon icon={faUser} />
                                    </button>
                                </div>
                            )
                    }
                </div>

                {
                    token ? (
                        <nav className={`sidenav my-5 ${isOpen ? 'open' : ''}`}>
                            <div className="search-bar mb-4">
                                <input onChange={(e) => searchBar(e)} type="text" id='searchBar' className="form-control" placeholder="Search Session" aria-label="session"
                                    style={{ paddingLeft: "12px" }} />
                            </div>

                            {filteredSessions.length > 0 && (
                                <div className="search-bar-menu show" ref={dropdownRef}>
                                    <ul>
                                        {filteredSessions.map(session => (
                                            <li onClick={() => navigateFromSearchBar(session.sessionId)} key={session.sessionId}>
                                                {session.sessionName}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <span><h6 className='chatSession'>Klaus-AI</h6></span>
                            <div className="search-bar mb-1">
                                <button onClick={homePage} className="homepage">
                                    <FontAwesomeIcon icon={faHouse} style={{ marginRight: "3px" }}/>
                                    Home 
                                </button>
                            </div>

                            {/* Collapsible folder starts here */}
                            <div className="folder-container mb-2">
                                <button
                                    className={`btn btn-secondary folder-btn ${isKnowledgeFolderOpen ? 'open' : ''}`}
                                    type="button"
                                    onClick={toggleKnowledge}
                                >
                                    <div>
                                        <FontAwesomeIcon icon={faMessage} style={{ marginRight: "3px" }} />
                                        Knowledge
                                    </div>
                                    <span className="folder-icon">
                                        <FontAwesomeIcon icon={isKnowledgeFolderOpen ? faAngleUp : faAngleDown} />
                                    </span>
                                </button>

                                {/* Conditionally render the folder's contents */}
                                {isKnowledgeFolderOpen && (
                                    <div className="session-content">
                                        {sessions.slice().map((session) => (
                                            <NavLink
                                                to={`/textgenerator/${session.sessionId}`}
                                                className={({ isActive }) =>
                                                    isActive ? "session-item active" : "session-item"
                                                } // Apply active class to session-item div
                                                key={session.sessionId}
                                            >
                                                {editingSessionId === session.sessionId ? (
                                                    <input
                                                        type="text"
                                                        value={newSessionName}
                                                        onChange={(e) =>
                                                            setNewSessionName(e.target.value)
                                                        }
                                                        onBlur={() =>
                                                            handleRenameSession(session.sessionId)
                                                        }
                                                        onKeyDown={(e) =>
                                                            e.key === "Enter" &&
                                                            handleRenameSession(session.sessionId)
                                                        }
                                                        className="session-rename-input"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div
                                                        onDoubleClick={() =>
                                                            startEditing(
                                                                session.sessionId,
                                                                session.sessionName
                                                            )
                                                        }
                                                    >
                                                        <>
                                                            <span style={{ marginRight: "5px" }}>
                                                                {session.priority && (
                                                                    <FontAwesomeIcon
                                                                        icon={faThumbtack}
                                                                    />
                                                                )}
                                                            </span>
                                                            <span>{session.sessionName}</span>
                                                        </>
                                                    </div>
                                                )}
                                                {present && session.present && (
                                                    <>
                                                        <span className="ellipsis-icon">
                                                            <button
                                                                className="edit"
                                                                onClick={() =>
                                                                    sessionEdit(session.sessionId)
                                                                }
                                                            >
                                                                <FontAwesomeIcon icon={faEllipsis} />
                                                            </button>
                                                        </span>
                                                        {isSessionDropdownOpen ===
                                                            session.sessionId && (
                                                                <div
                                                                    className="session-dropdown"
                                                                    ref={dropdownRef}
                                                                >
                                                                    <ul>
                                                                        <li
                                                                            onClick={() =>
                                                                                updatePriority(
                                                                                    session.sessionId,
                                                                                    session.priority
                                                                                )
                                                                            }
                                                                        >
                                                                            {session.priority
                                                                                ? "Unpin"
                                                                                : "Pin"}
                                                                        </li>
                                                                        <li
                                                                            onClick={() =>
                                                                                startEditing(
                                                                                    session.sessionId,
                                                                                    session.sessionName
                                                                                )
                                                                            }
                                                                        >
                                                                            Rename
                                                                        </li>
                                                                        <li
                                                                            onClick={() =>
                                                                                handleDeleteClick(
                                                                                    session.sessionId
                                                                                )
                                                                            }
                                                                        >
                                                                            Delete
                                                                        </li>
                                                                        <li
                                                                            onClick={() =>
                                                                                downloadChatPdf(
                                                                                    session.sessionId,
                                                                                    session.sessionName
                                                                                )
                                                                            }
                                                                        >
                                                                            Export
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            )}
                                                    </>
                                                )}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Collapsible folder ends here */}

                            {/* Collapsible folder starts here */}
                            <div className="folder-container">
                                <button
                                    className={`btn btn-secondary folder-btn ${isCreativeFolderOpen ? 'open' : ''}`}
                                    type="button"
                                    onClick={toggleCreative}
                                >
                                    <div>
                                        <FontAwesomeIcon icon={faPhotoFilm} style={{ marginRight: "3px" }} />
                                        Creative
                                    </div>
                                    <span className="folder-icon">
                                        <FontAwesomeIcon icon={isCreativeFolderOpen ? faAngleUp : faAngleDown} />
                                    </span>
                                </button>

                                {/* Conditionally render the folder's contents */}
                                {isCreativeFolderOpen && (
                                    <div className="session-content">
                                        {sessions.slice().map((session) => (
                                            <NavLink
                                                to={`/textgenerator/${session.sessionId}`}
                                                className={({ isActive }) =>
                                                    isActive ? "session-item active" : "session-item"
                                                } // Apply active class to session-item div
                                                key={session.sessionId}
                                            >
                                                {editingSessionId === session.sessionId ? (
                                                    <input
                                                        type="text"
                                                        value={newSessionName}
                                                        onChange={(e) =>
                                                            setNewSessionName(e.target.value)
                                                        }
                                                        onBlur={() =>
                                                            handleRenameSession(session.sessionId)
                                                        }
                                                        onKeyDown={(e) =>
                                                            e.key === "Enter" &&
                                                            handleRenameSession(session.sessionId)
                                                        }
                                                        className="session-rename-input"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div
                                                        onDoubleClick={() =>
                                                            startEditing(
                                                                session.sessionId,
                                                                session.sessionName
                                                            )
                                                        }
                                                    >
                                                        <>
                                                            <span style={{ marginRight: "5px" }}>
                                                                {session.priority && (
                                                                    <FontAwesomeIcon
                                                                        icon={faThumbtack}
                                                                    />
                                                                )}
                                                            </span>
                                                            <span>{session.sessionName}</span>
                                                        </>
                                                    </div>
                                                )}
                                                {present && session.present && (
                                                    <>
                                                        <span className="ellipsis-icon">
                                                            <button
                                                                className="edit"
                                                                onClick={() =>
                                                                    sessionEdit(session.sessionId)
                                                                }
                                                            >
                                                                <FontAwesomeIcon icon={faEllipsis} />
                                                            </button>
                                                        </span>
                                                        {isSessionDropdownOpen ===
                                                            session.sessionId && (
                                                                <div
                                                                    className="session-dropdown"
                                                                    ref={dropdownRef}
                                                                >
                                                                    <ul>
                                                                        <li
                                                                            onClick={() =>
                                                                                updatePriority(
                                                                                    session.sessionId,
                                                                                    session.priority
                                                                                )
                                                                            }
                                                                        >
                                                                            {session.priority
                                                                                ? "Unpin"
                                                                                : "Pin"}
                                                                        </li>
                                                                        <li
                                                                            onClick={() =>
                                                                                startEditing(
                                                                                    session.sessionId,
                                                                                    session.sessionName
                                                                                )
                                                                            }
                                                                        >
                                                                            Rename
                                                                        </li>
                                                                        <li
                                                                            onClick={() =>
                                                                                handleDeleteClick(
                                                                                    session.sessionId
                                                                                )
                                                                            }
                                                                        >
                                                                            Delete
                                                                        </li>
                                                                        <li
                                                                            onClick={() =>
                                                                                downloadChatPdf(
                                                                                    session.sessionId,
                                                                                    session.sessionName
                                                                                )
                                                                            }
                                                                        >
                                                                            Export
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            )}
                                                    </>
                                                )}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Collapsible folder ends here */}
                        </nav>
                    ) : (
                        <nav className={`sidenav my-5 ${isOpen ? 'open' : ''}`}>
                            <span><h6 className='chatSession'>Klaus-AI</h6></span>

                            <div className="search-bar">
                                <button onClick={homePage} className="homepage">
                                    <FontAwesomeIcon icon={faHouse} style={{ marginRight: "3px" }}/>
                                    Home 
                                </button>
                            </div>
                        </nav>
                    )
                }
            </div>

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
                <Profile setProfileOpen={setProfileOpen} />
            )}


            {/* ToastContainer to display toasts */}
            <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
        </>
    );
}
