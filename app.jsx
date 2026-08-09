import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

function LinuxTerminal() {
  const terminalRef = useRef(null);
  const termInstance = useRef(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: 'monospace',
      fontSize: 14,
      theme: {
        background: '#0b0c10',
        foreground: '#66fcf1',
        cursor: '#66fcf1'
      }
    });

    termInstance.current = term;

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);

    // Auto focus terminal input immediately
    term.focus();

    setTimeout(() => fitAddon.fit(), 100);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      term.write('\r\n\x1b[32m[+] Connected to SILENT KILLER OS Linux Kernel...\x1b[0m\r\n\r\n');
      term.focus();
    };

    ws.onmessage = (e) => {
      term.write(e.data);
    };

    ws.onerror = () => {
      term.write('\r\n\x1b[31m[-] WebSocket Error: Connection failed.\x1b[0m\r\n');
    };

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      ws.close();
      term.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      ref={terminalRef} 
      style={{ width: '100%', height: '100%' }} 
      onClick={() => termInstance.current?.focus()}
    />
  );
}

export default function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

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

      {/* Linux Terminal Window */}
      {openTerminal && (
        <div className="window terminal-window">
          <div className="window-header">
            <span>nirob@silent-killer-bash</span>
            <button className="close-btn" onClick={() => setOpenTerminal(false)}></button>
          </div>
          <div className="window-body terminal-body">
            <LinuxTerminal />
          </div>
        </div>
      )}

      {/* Hacker AI Window */}
      {openHackerAI && (
        <div className="window hacker-ai-window">
          <div className="window-header">
            <span>Hacker AI - (https://hackerai.co/)</span>
            <div className="header-actions">
              <a href="https://hackerai.co/" target="_blank" rel="noreferrer" className="external-link">
                Open External ↗
              </a>
              <button className="close-btn" onClick={() => setOpenHackerAI(false)}></button>
            </div>
          </div>
          <div className="window-body iframe-body">
            <iframe src="https://hackerai.co/" title="Hacker AI" className="app-iframe" />
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
