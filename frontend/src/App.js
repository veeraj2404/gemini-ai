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
  const [sessions, setSessions] = useState([{ sessionId: 1 }]);
  const [untitledSession, setUntitledSession] = useState(true);

  const toggleSideNav = () => {
    setSideNavOpen(!isSideNavOpen);
  };

  const handleNewSession = useCallback((sessionId) => {
    setSessions([...sessions, {sessionId: sessionId }]); // Add new session to session list
  }, [sessions]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (sessions.length === 0) {
      handleNewSession(1);  // Ensure at least one session is created on app start
    }
    if (token) {
      // If the token exists, redirect to TextGenerator
      navigate(`/textgenerator/session/${sessions.length}`);
    }
  }, [handleNewSession, sessions.length]);

  return (

      <div className="app-container ">
        <SideNav isOpen={isSideNavOpen} toggleSideNav={toggleSideNav} onNewSession={handleNewSession} sessions={sessions} setSessions={setSessions} untitledSession={untitledSession} setUntitledSession={setUntitledSession}/>
        <Routes>
          <Route path="/" element={<LoginSignup />} />
          <Route path="/loginsignup" element={<LoginSignup />} />
          <Route path="/textgenerator/session/:sessionId" element={<TextGenerator untitledSession={untitledSession} setUntitledSession={setUntitledSession}/>} /> {/* Route for session */}
          <Route path="/textgenerator" element={<TextGenerator />} />
          <Route path="/imagecontent" element={<ImageContent />} />
        </Routes>
      </div>
  );
}

export default App;
