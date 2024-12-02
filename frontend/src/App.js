import './App.css';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import TextGenerator from './Components/TextGenerator/TextGenerator';
import SideNav from './Components/SideNavbar/SideNav';
import { useCallback, useEffect, useState } from 'react';
import LoginSignup from './Components/Login/LoginSignup';
import Home from './Components/Home/Home';
import ImageContentGenerator from './Components/ImageContentGenerator/ImageContentGenerator';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSideNavOpen, setSideNavOpen] = useState(true);
  const [sessions, setSessions] = useState([{ priority: false, sessionId: 1, sessionName: 'Chat Session 1' }]);
  const [imageSessions, setImageSessions] = useState([{ priority: false, imageSessionId: 1, imageSessionName: 'Image Session 1' }]);
  const [untitledSession, setUntitledSession] = useState(true);
  const [imageUntitledSession, setImageUntitledSession] = useState(true);

  const toggleSideNav = () => {
    setSideNavOpen(!isSideNavOpen);
  };

  const handleNewSession = useCallback((id, present) => {

    if (location.pathname.startsWith("/textgenerator/")) {
      setSessions((prevSessions) => {
        if (prevSessions.length === 1 && prevSessions[0].sessionId === 1 && !present) {
          return prevSessions; // If default session exists, don't add a new one
        }

        // Find the index of the last session with priority true
        const lastPriorityIndex = prevSessions.reduce((lastIndex, session, index) => {
          return session.priority ? index : lastIndex;
        }, -1);

        // Create a new session object
        const newSession = { priority: false, sessionId: id, sessionName: `Chat Session ${id}` };
        // Insert after the last priority session
        return [
          ...prevSessions.slice(0, lastPriorityIndex + 1),
          newSession,
          ...prevSessions.slice(lastPriorityIndex + 1),
        ];
      });
    } else if (location.pathname.startsWith("/imagegenerator/")) {
      setImageSessions((prevSessions) => {
        if (prevSessions.length === 1 && prevSessions[0].imageSessionId === 1 && !present) {
          return prevSessions; // If default session exists, don't add a new one
        }

        // Find the index of the last session with priority true
        const lastPriorityIndex = prevSessions.reduce((lastIndex, session, index) => {
          return session.priority ? index : lastIndex;
        }, -1);

        // Create a new session object
        const newSession = { priority: false, imageSessionId: id, imageSessionName: `Image Session ${id}` };
        // Insert after the last priority session
        return [
          ...prevSessions.slice(0, lastPriorityIndex + 1),
          newSession,
          ...prevSessions.slice(lastPriorityIndex + 1),
        ];
      });
    } else {
      return
    }

  }, [location.pathname]);


  useEffect(() => {
    const token = localStorage.getItem('token');
    const path = localStorage.getItem('path');
    if (token) {
      if( path === "/textgenerator/" && sessions.length > 0){
        const id = Math.max(...sessions.map(session => session.sessionId));
        navigate(`/textgenerator/${id}`);
      } else if ( path === "/imagegenerator/" && imageSessions.length > 0){
        const id = Math.max(...imageSessions.map(session => session.imageSessionId));
        navigate(`/imagegenerator/${id}`);
      } else{
        navigate('/home')
      }
    }
  }, [sessions, imageSessions]);

  return (

    <div className="app-container ">
      <SideNav isOpen={isSideNavOpen} toggleSideNav={toggleSideNav} onNewSession={handleNewSession} imageSessions={imageSessions} setImageSessions={setImageSessions} sessions={sessions} setSessions={setSessions} untitledSession={untitledSession} setUntitledSession={setUntitledSession} imageUntitledSession={imageUntitledSession} setImageUntitledSession={setImageUntitledSession} />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/loginsignup" element={<LoginSignup />} />
        <Route path="/textgenerator/:sessionId" element={<TextGenerator untitledSession={untitledSession} setUntitledSession={setUntitledSession} />} /> {/* Route for session */}
        <Route path="/imagegenerator/:imageSessionId" element={<ImageContentGenerator imageUntitledSession={imageUntitledSession} setImageUntitledSession={setImageUntitledSession} />} />
      </Routes>
    </div>
  );
}

export default App;
