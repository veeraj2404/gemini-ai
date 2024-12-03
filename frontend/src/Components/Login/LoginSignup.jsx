import React, { useState } from 'react';
import * as service from './LoginSignupService';
import './LoginSignup.css';
import { useNavigate } from 'react-router-dom';

export default function LoginSignup() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          return;
        }
        const data = await service.signup(username, email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('email', data.email);
        localStorage.setItem('username', data.username);
        window.location.reload();
        // Redirect to text generator on successful signup
        navigate('/textgenerator');
      } else {
        const data = await service.login(email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('email', data.email);
        localStorage.setItem('username', data.username);
        window.location.reload();
        // Redirect to text generator on successful signup
        navigate('/textgenerator');
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="login-signup-container">
      <form className="login-signup-form" onSubmit={handleSubmit}>
        <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
        {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}
        {isSignUp && (
          <input
            className='inputfield'
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />)}
        <input
          className='inputfield'
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className='inputfield'
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {isSignUp && (
          <input
            className='inputfield'
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        )}
        <button type="submit" className="submit-btn">
          {isSignUp ? 'Sign Up' : 'Login'}
        </button>
        <p onClick={toggleMode} className="toggle-btn">
          {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </p>
      </form>
    </div>
  );
}
