import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faIcons, faImage } from '@fortawesome/free-solid-svg-icons';
import './Home.css'
import { useNavigate } from 'react-router-dom';

export default function Home({ sessions, imageSessions, setCreativeFolderOpen, setKnowledgeFolderOpen }) {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(1)
  const [imageSessionId, setImageSessionId] = useState(1)

  useEffect(() => {
    localStorage.setItem('path', '/home');
    if (sessions) {
      const sId = Math.max(...sessions.map(session => session.sessionId));
      setSessionId(sId)
    }

    if (imageSessions) {
      const iId = Math.max(...imageSessions.map(session => session.imageSessionId));
      setImageSessionId(iId)
    }
  }, [sessions, imageSessions])

  const knowledge = () => {
    if(token) {
      navigate(`/textgenerator/${sessionId}`)
      setKnowledgeFolderOpen(true)
      setCreativeFolderOpen(false)
    } else {
      navigate('/textgenerator')
    }
  }

  const creative = () => {
    if(token) {
      navigate(`/imagegenerator/${imageSessionId}`)
      setKnowledgeFolderOpen(false)
      setCreativeFolderOpen(true)
    }
  }

  const loginPage = () => {
    navigate('/loginsignup')
  }

  return (
    <div className='container mt-4'>
      <div className="row row-cols-1 row-cols-md-2 g-4 mx-2">
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Hi {username},<br />Your AI Workspace</h5>
              <p className="card-text">A customized AI platform with advanced capabilities for image and content generation.</p>
              {!token &&
                <button onClick={loginPage} type="button" className='btn loginButton px-5 py-2'>Login</button>
              }
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Klaus-AI<br />Smart AI Assistant</h5>
              <p className="card-text">Experience the next generation of AI-powered creativity and productivity tools, all in one seamless workspace.</p>
              {!token &&
                <button onClick={loginPage} type="button" className='btn loginButton px-5 py-2'>Login</button>
              }
            </div>
          </div>
        </div>
      </div>

      <div className="card-group">
        <div className="card cardarrow" onClick={knowledge}>
          <FontAwesomeIcon icon={faBrain} className='homeicon' />
          <div className="card-body mt-4">
            <h5 className="card-title">Knowledge</h5>
            <p className="card-text">AI-based creation of human-like text.</p>
          </div>
        </div>
        <div className="card cardarrow" onClick={creative}>
          <FontAwesomeIcon icon={faIcons} className='homeicon' />
          <div className="card-body mt-4">
            <h5 className="card-title">Creative</h5>
            <p className="card-text">AI analysis of visual data for insights.</p>
          </div>
        </div>
        <div className="card cardarrow">
          <FontAwesomeIcon icon={faImage} className='homeicon' />
          <div className="card-body mt-4">
            <h5 className="card-title">Image Generation</h5>
            <p className="card-text">AI creation of images from text descriptions. <span style={{ color: "rgb(131, 133, 132)" }}>[Coming Soon]</span></p>
          </div>
        </div>
      </div>

    </div>
  )
}
