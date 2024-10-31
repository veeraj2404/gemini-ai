import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faPenToSquare, faEllipsis, faUser } from '@fortawesome/free-solid-svg-icons';
import './SideNav.css';
import * as service from './SideNavService';
import Settings from '../Setting/Settings.jsx';

export default function SideNav({ isOpen, toggleSideNav, onNewSession, sessions, setSessions, untitledSession, setUntitledSession }) {

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const [isDropdownOpen, setDropdownOpen] = useState(false); // State to manage dropdown visibility
    const [isSessionDropdownOpen, setSessionDropdownOpen] = useState(null); // State to manage dropdown visibility
    const dropdownRef = useRef(null);
    const [isModalOpen, setModalOpen] = useState(false); // Controls modal visibility
    const [isSettingOpen, setSettingOpen] = useState(false); // Controls settings visibility
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [newSessionName, setNewSessionName] = useState("");

    const [selectedSession, setSelectedSession] = useState(null); // Holds session to be deleted

    useEffect(() => {
        const fetchSession = async () => {
            if (token) {
                try {
                    const data = await service.getSession(userId); // Fetch the session data from backend
                    setSessions(data || []); // Update sessions state with fetched data
                } catch (error) {
                    console.error('Error fetching session data:', error);
                }
            }
        };
        fetchSession();
    }, [setSessions, token, userId, isModalOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false); // Close the dropdown
                setSessionDropdownOpen(null)
            }
        };

        if (isDropdownOpen || isSessionDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside); // Listen for outside clicks
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside); // Cleanup event listener
        };
    }, [isDropdownOpen, isSessionDropdownOpen]);

    const toggleDropdown = () => {
        setDropdownOpen(prev => !prev);
    }

    const logout = () => {
        localStorage.clear();
        navigate('/loginsignup');
    }

    const createNewSession = () => {
        if (untitledSession) {
            const newSessionId = sessions.length + 1; // Incremental ID
            navigate(`/textgenerator/session/${newSessionId}`);
            onNewSession(newSessionId); // Notify the parent to update the current session
            setUntitledSession(false)
        }
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
            await service.updateSessionName(sessionId, newSessionName, userId);
        } catch (error) {
            console.error("Failed to update session name:", error);
        }
    };

    const sessionEdit = (sessionId) => {
        setSessionDropdownOpen(prev => (prev === sessionId ? null : sessionId))
        console.log("session update: ", sessionId);
    }


    const handleDeleteClick = (sessionId) => {
        setSelectedSession(sessionId);
        setModalOpen(true); // Open the modal
    };

    const handleProfile = () => {
        setDropdownOpen(false)
        setSettingOpen(true)
    }

    const confirmDeleteSession = async (selectedSession) => {
        await service.deleteSession(selectedSession, userId)
        setModalOpen(false); // Close the modal
    };

    return (
        <>
            <div className={`side-nav-container ${isOpen ? '' : 'bgChange'}`}>
                <div className={`main-content ${isOpen ? 'shifted' : 'unshifted'}`}>
                    <button className={`openbtn ${isOpen ? '' : 'bgChange'}`} onClick={toggleSideNav}>
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    {
                        token && (
                            <div className="profile-container" ref={dropdownRef}>
                                <button className={`openedit ${isOpen ? '' : 'bgChange'}`} onClick={createNewSession}>
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                </button>
                                <button className={`openprofile ${isOpen ? '' : 'bgChange'}`} onClick={toggleDropdown}>
                                    <FontAwesomeIcon icon={faUser} />
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
                        )
                    }
                </div>

                {
                    token &&
                    <nav className={`sidenav my-5 ${isOpen ? 'open' : ''}`}>
                        <span> <h6 className='chatSession'>Chat Sessions</h6></span>
                        {sessions.slice().reverse().map(session => (
                            <NavLink
                                to={`/textgenerator/session/${session.sessionId}`}
                                className={({ isActive }) => (isActive ? 'session-item active' : 'session-item')} // Apply active class to session-item div
                                key={session.sessionId}
                            >
                                {editingSessionId === session.sessionId ? (
                                    <input
                                        type="text"
                                        value={newSessionName}
                                        onChange={(e) => setNewSessionName(e.target.value)}
                                        onBlur={() => handleRenameSession(session.sessionId)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSession(session.sessionId)}
                                        className="session-rename-input"
                                        autoFocus
                                    />
                                ) : (
                                    <div onDoubleClick={() => startEditing(session.sessionId, session.sessionName)}>
                                        {session.sessionName ? session.sessionName : `Chat Session ${session.sessionId}`}
                                    </div>
                                )}

                                <span className="ellipsis-icon">
                                    <button className='edit' onClick={() => sessionEdit(session.sessionId)}>
                                        <FontAwesomeIcon icon={faEllipsis} />
                                    </button>
                                </span>
                                {isSessionDropdownOpen === session.sessionId && (
                                    <div className="session-dropdown" ref={dropdownRef}>
                                        <ul>
                                            <li onClick={() => startEditing(session.sessionId, session.sessionName)}>Rename</li>
                                            <li onClick={() => handleDeleteClick(session.sessionId)}>Delete</li>
                                        </ul>
                                    </div>
                                )}
                            </NavLink>
                        ))}
                    </nav>
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
                                    style={{backgroundColor: ""}}
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

            {/* Settings Modal */}
            {isSettingOpen && (
                <Settings setSettingOpen={setSettingOpen} />
            )}
        </>
    );
}