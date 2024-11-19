import './App.css';
import { Route, Routes, useNavigate } from 'react-router-dom';
import ImageContent from './Components/ImageGenerator/ImageContent';
import TextGenerator from './Components/TextGenerator/TextGenerator';
import SideNav from './Components/SideNavbar/SideNav';
import { useCallback, useEffect, useState } from 'react';
import LoginSignup from './Components/Login/LoginSignup';

function App() {
  const navigate = useNavigate();

  const [isSideNavOpen, setSideNavOpen] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [untitledSession, setUntitledSession] = useState(true);

  const toggleSideNav = () => {
    setSideNavOpen(!isSideNavOpen);
  };

  const handleNewSession = useCallback((sessionId, present) => {
    setSessions((prevSessions) => {
      if (prevSessions.length === 1 && prevSessions[0].sessionId === 1 && !present) {
        return prevSessions; // If default session exists, don't add a new one
      }

      // Find the index of the last session with priority true
      const lastPriorityIndex = prevSessions.reduce((lastIndex, session, index) => {
        return session.priority ? index : lastIndex;
      }, -1);

      // Create a new session object
      const newSession = { priority: false, sessionId, sessionName: `Chat Session ${sessionId}` };
      // Insert after the last priority session
      return [
        ...prevSessions.slice(0, lastPriorityIndex + 1),
        newSession,
        ...prevSessions.slice(lastPriorityIndex + 1),
      ];
    });
  }, []);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (sessions.length === 0) {
      handleNewSession(1, false);  // Ensure at least one session is created on app start
    }
    if (token && sessions.length > 0) {
      // If the token exists, redirect to TextGenerator
      const id = Math.max(...sessions.map(session => session.sessionId));
      navigate(`/textgenerator/session/${id}`);
    }
  }, [handleNewSession, sessions]);

  return (

    <div className="app-container ">
      <SideNav isOpen={isSideNavOpen} toggleSideNav={toggleSideNav} onNewSession={handleNewSession} sessions={sessions} setSessions={setSessions} untitledSession={untitledSession} setUntitledSession={setUntitledSession} />
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route path="/loginsignup" element={<LoginSignup />} />
        <Route path="/textgenerator/session/:sessionId" element={<TextGenerator untitledSession={untitledSession} setUntitledSession={setUntitledSession} />} /> {/* Route for session */}
        <Route path="/textgenerator" element={<TextGenerator />} />
      </Routes>
    </div>
  );
}

export default App;
