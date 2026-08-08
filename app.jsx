import React, { useState, useEffect } from 'react';

export default function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Windows State
  const [openTerminal, setOpenTerminal] = useState(true);
  const [openHackerAI, setOpenHackerAI] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '3idiots') {
      setIsLocked(false);
      setError(false);
      setPassword('');
    } else {
      setError(true);
    }
  };

  // Lock Screen View
  if (isLocked) {
    return (
      <div className="lock-screen">
        <div className="lock-card">
          <h1>SILENT KILLER OS</h1>
          <p className="subtitle">Designed & Developed by nirob bhaiiii</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={error ? 'input-error' : ''}
              autoFocus
            />
            <button type="submit" className="login-btn">
              Unlock
            </button>
          </form>
          {error && <p className="error-text">Incorrect Password! Hint: 3idiots</p>}
        </div>
      </div>
    );
  }

  // Desktop View
  return (
    <div className="desktop">
      {/* Desktop Icons */}
      <div className="desktop-icons">
        <div className="icon" onClick={() => setOpenHackerAI(true)}>
          <div className="icon-img">🤖</div>
          <span>Hacker AI</span>
        </div>
        <div className="icon" onClick={() => setOpenTerminal(true)}>
          <div className="icon-img">💻</div>
          <span>Terminal</span>
        </div>
      </div>

      {/* Terminal / System Info Window */}
      {openTerminal && (
        <div className="window">
          <div className="window-header">
            <span>Terminal / System Info</span>
            <button className="close-btn" onClick={() => setOpenTerminal(false)}></button>
          </div>
          <div className="window-body">
            <h3>Welcome to SILENT KILLER OS</h3>
            <p className="dev-credit">Developer: <strong>nirob bhaiiii</strong></p>
            <hr />
            <p className="status-text">System Status: Active & Secured</p>
            <p className="status-text">Apps Installed: Hacker AI</p>
          </div>
        </div>
      )}

      {/* Hacker AI Window */}
      {openHackerAI && (
        <div className="window hacker-ai-window">
          <div className="window-header">
            <span>Hacker AI - (https://hackerai.co/)</span>
            <div className="header-actions">
              <a 
                href="https://hackerai.co/" 
                target="_blank" 
                rel="noreferrer" 
                className="external-link"
              >
                Open External ↗
              </a>
              <button className="close-btn" onClick={() => setOpenHackerAI(false)}></button>
            </div>
          </div>
          <div className="window-body iframe-body">
            <iframe
              src="https://hackerai.co/"
              title="Hacker AI"
              className="app-iframe"
            />
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div className="taskbar">
        <button className="start-btn" onClick={() => setOpenHackerAI(true)}>
          🤖 Hacker AI
        </button>
        <button className="start-btn secondary" onClick={() => setOpenTerminal(true)}>
          💻 Terminal
        </button>
        <button className="lock-btn" onClick={() => setIsLocked(true)}>
          Lock OS
        </button>
        <span className="clock">{time}</span>
      </div>
    </div>
  );
}
