import React, { useEffect, useState } from 'react'
import './Settings.css';
import profile from '../../Assets/profile.jpg';
import * as service from './Settings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';


export default function Settings({ setSettingOpen }) {
    const userId = localStorage.getItem('userId');
    const [message, setMessage] = useState('');

    // const [profilePic, setProfilePic] = useState(profile);
    const [preview, setPreview] = useState(profile);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmNewPass, setConfirmNewPass] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const user = await service.getUser(userId);
            setUsername(user.username);
            setEmail(user.email);
        }

        getUser()
    }, [userId])


    const setModalOpen = () => {
        setSettingOpen(false)
    }

    const save = async () => {
        if (newPass !== confirmNewPass) {
            setMessage('Password does not match')
            return
        }
        
        const data = {
            username: username,
            email: email,
            password: oldPass,
            newPass: newPass
        }

        const user = await service.updateProfile(data);
        setMessage(user.message);

        if (user.message === 'Update Successfully') {
            setOldPass('');
            setNewPass('');
            setConfirmNewPass('');
            const elements = document.querySelectorAll('.message-alert');
            elements.forEach((element) => {
                element.style.color = 'green';
            });
        } else{
            const elements = document.querySelectorAll('.message-alert');
            elements.forEach((element) => {
                element.style.color = 'red';
            });
        }

    }

    const previewImage = (e) => {
        const file = e.target.files[0];

        if (file) {
            // setProfilePic(file);
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl); // Update preview
        }
    }

    return (
        <div className="modal show d-block " tabIndex="-1" role="dialog" >
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header heading">
                        <h5 className="modal-title">Settings</h5>

                    </div>
                    <div className="modal-body content-body">
                        <div className="left-content">
                            <div className="input-group">
                                <span className="input-group-text" >Username</span>
                                <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" className="form-control" />
                            </div>
                            <div className="input-group">
                                <span className="input-group-text" >Email</span>
                                <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" className="form-control" />
                            </div>
                            <div className="input-group">
                                <span className="input-group-text" >Old Pass</span>
                                <input value={oldPass} onChange={(e) => setOldPass(e.target.value)} type={showPassword ? 'text' : 'password'} className="form-control" />
                                <button
                                    type="button"
                                    onMouseDown={() => setShowPassword(true)}
                                    onMouseUp={() => setShowPassword(false)}
                                    onMouseLeave={() => setShowPassword(false)}
                                    style={{ position: 'absolute', right: '5px', border: 'none', marginTop: '5px', background: 'transparent' }}
                                >
                                    {showPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
                                </button>
                            </div>
                            <div className="input-group">
                                <span className="input-group-text" >New Pass</span>
                                <input value={newPass} onChange={(e) => setNewPass(e.target.value)} type={showNewPassword ? 'text' : 'password'} className="form-control" />
                                <button
                                    type="button"
                                    onMouseDown={() => setShowNewPassword(true)}
                                    onMouseUp={() => setShowNewPassword(false)}
                                    onMouseLeave={() => setShowNewPassword(false)}
                                    style={{ position: 'absolute', right: '5px', border: 'none', marginTop: '5px', background: 'transparent' }}
                                >
                                    {showNewPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
                                </button>
                            </div>
                            <div className="input-group">
                                <span className="input-group-text" >Confirm Pass</span>
                                <input value={confirmNewPass} onChange={(e) => setConfirmNewPass(e.target.value)} type={showConfirmPassword ? 'text' : 'password'} className="form-control" />
                                <button
                                    type="button"
                                    onMouseDown={() => setShowConfirmPassword(true)}
                                    onMouseUp={() => setShowConfirmPassword(false)}
                                    onMouseLeave={() => setShowConfirmPassword(false)}
                                    style={{ position: 'absolute', right: '5px', border: 'none', marginTop: '5px', background: 'transparent' }}
                                >
                                    {showConfirmPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
                                </button>
                            </div>
                            <span className='message-alert'>{message}</span>
                        </div>
                        <div className="right-content img-upload">
                            <img src={preview} className="rounded float-end" alt="Profile" />
                            <input type="file" id="file-input" accept="image/*" onChange={previewImage} />
                        </div>
                    </div>
                    <div className="modal-footer footer-content">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={setModalOpen}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={save}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
