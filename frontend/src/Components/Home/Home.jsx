import React, { useEffect } from 'react'

import './Home.css'
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('path', '/home');
  }, [])
  

  const loginPage = () => {
    navigate('/loginsignup')
  }

  return (
    <div className='container m-4'>
      <div className="row row-cols-1 row-cols-md-2 g-4">
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Your Personalized <br />AI Workspace</h5>
              <p className="card-text">Experience the next generation of AI-powered creativity and productivity tools, all in one seamless workspace.</p>
              { !token && 
                <button onClick={loginPage} type="button" className='btn loginButton px-5 py-2'>Login</button>
              }
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Your Personalized <br />AI Workspace</h5>
              <p className="card-text">Experience the next generation of AI-powered creativity and productivity tools, all in one seamless workspace.</p>
              { !token && 
                <button onClick={loginPage} type="button" className='btn loginButton px-5 py-2'>Login</button>
              }
              </div>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Your Personalized <br />AI Workspace</h5>
              <p className="card-text">Experience the next generation of AI-powered creativity and productivity tools, all in one seamless workspace.</p>
              { !token && 
                <button onClick={loginPage} type="button" className='btn loginButton px-5 py-2'>Login</button>
              }
              </div>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Your Personalized <br />AI Workspace</h5>
              <p className="card-text">Experience the next generation of AI-powered creativity and productivity tools, all in one seamless workspace.</p>
              { !token && 
                <button onClick={loginPage} type="button" className='btn loginButton px-5 py-2'>Login</button>
              }
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}
