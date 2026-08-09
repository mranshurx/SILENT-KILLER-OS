import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import './App.css';

/* ==========================================================================
   CLIENT-SIDE TERMINAL COMPONENT (Works on Static Sites & Dynamic Servers)
   ========================================================================== */
function LinuxTerminal() {
  const terminalRef = useRef(null);
  const termInstance = useRef(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // 1. Initialize xterm.js instance
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

    // 2. Load FitAddon to adjust size automatically
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    term.focus();

    // 3. Observe window resizes to automatically fit terminal grid
    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch (e) {}
    });
    resizeObserver.observe(terminalRef.current);

    // Terminal State Variables
    const prompt = '\r\n\x1b[32mnirob@silent-killer\x1b[0m:\x1b[34m~\x1b[0m$ ';
    let currentInput = '';
    const history = [];
    let historyIndex = 0;

    // Banner Greeting
    term.writeln('\x1b[32m[+] SILENT KILLER OS Kernel v1.0.0 (Client-Side)\x1b[0m');
    term.writeln('Type \x1b[33mhelp\x1b[0m to list available built-in commands.\r\n');
    term.write(prompt);

    // Command Execution Logic
    const handleCommand = (cmd) => {
      const trimmed = cmd.trim();
      const parts = trimmed.split(' ');
      const command = parts[0].toLowerCase();
      const args = parts.slice(1);

      if (trimmed.length > 0) {
        history.push(trimmed);
        historyIndex = history.length;
      }

      term.write('\r\n');

      switch (command) {
        case '':
          break;

        case 'help':
          term.writeln('\x1b[36mAvailable Built-in Commands:\x1b[0m');
          term.writeln('  \x1b[33mhelp\x1b[0m       - Display this assistance menu');
          term.writeln('  \x1b[33mclear\x1b[0m      - Clear the terminal screen');
          term.writeln('  \x1b[33mwhoami\x1b[0m     - Print active user identity');
          term.writeln('  \x1b[33mdate\x1b[0m       - Show current system date and time');
          term.writeln('  \x1b[33mecho\x1b[0m       - Output text to console');
          term.writeln('  \x1b[33mls\x1b[0m         - List directory contents');
          term.writeln('  \x1b[33mcat\x1b[0m        - Display contents of a file');
          term.writeln('  \x1b[33msysinfo\x1b[0m    - Show browser environment details');
          break;

        case 'clear':
          term.clear();
          break;

        case 'whoami':
          term.writeln('nirob (root access)');
          break;

        case 'date':
          term.writeln(new Date().toString());
          break;

        case 'echo':
          term.writeln(args.join(' '));
          break;

        case 'ls':
          term.writeln('\x1b[34mDesktop  Documents  Downloads  Projects  readme.txt\x1b[0m');
          break;

        case 'cat':
          if (args[0] === 'readme.txt') {
            term.writeln('Welcome to SILENT KILLER OS Web Desktop Environment.');
          } else if (args.length === 0) {
            term.writeln('Usage: cat <filename>');
          } else {
            term.writeln(`cat: ${args[0]}: No such file or directory`);
          }
          break;

        case 'sysinfo':
          term.writeln(`Platform: ${navigator.platform}`);
          term.writeln(`User Agent: ${navigator.userAgent}`);
          term.writeln(`Resolution: ${window.screen.width}x${window.screen.height}`);
          break;

        default:
          term.writeln(`\x1b[31mCommand not found: ${command}\x1b[0m. Type \x1b[33mhelp\x1b[0m for available commands.`);
          break;
      }

      term.write(prompt);
    };

    // Keystroke Processing Listener
    const dataDisposable = term.onData((e) => {
      switch (e) {
        case '\r': // Enter key
          handleCommand(currentInput);
          currentInput = '';
          break;

        case '\u007F': // Backspace key
          if (currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
            term.write('\b \b');
          }
          break;

        case '\u0003': // Ctrl+C interrupt
          term.write('^C');
          currentInput = '';
          term.write(prompt);
          break;

        case '\u001b[A': // Up Arrow (Command History)
          if (history.length > 0 && historyIndex > 0) {
            historyIndex--;
            while (currentInput.length > 0) {
              term.write('\b \b');
              currentInput = currentInput.slice(0, -1);
            }
            currentInput = history[historyIndex];
            term.write(currentInput);
          }
          break;

        case '\u001b[B': // Down Arrow (Command History)
          if (historyIndex < history.length - 1) {
            historyIndex++;
            while (currentInput.length > 0) {
              term.write('\b \b');
              currentInput = currentInput.slice(0, -1);
            }
            currentInput = history[historyIndex];
            term.write(currentInput);
          } else if (historyIndex === history.length - 1) {
            historyIndex++;
            while (currentInput.length > 0) {
              term.write('\b \b');
              currentInput = currentInput.slice(0, -1);
            }
          }
          break;

        default: // Standard printable characters
          if (e >= ' ' && e <= '~') {
            currentInput += e;
            term.write(e);
          }
          break;
      }
    });

    return () => {
      dataDisposable.dispose();
      term.dispose();
      resizeObserver.disconnect();
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

/* ==========================================================================
   MAIN OS APPLICATION COMPONENT
   ========================================================================== */
export default function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Window visibility toggles
  const [openTerminal, setOpenTerminal] = useState(true);
  const [openHackerAI, setOpenHackerAI] = useState(false);
  const [openCodeRunner, setOpenCodeRunner] = useState(false);

  // System clock timer
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

  // Lock Screen Render
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

  // Active Desktop Render
  return (
    <div className="desktop">
      {/* Desktop Launcher Icons */}
      <div className="desktop-icons">
        <div className="icon" onClick={() => setOpenHackerAI(true)}>
          <div className="icon-img">🤖</div>
          <span>Hacker AI</span>
        </div>
        <div className="icon" onClick={() => setOpenTerminal(true)}>
          <div className="icon-img">💻</div>
          <span>Terminal</span>
        </div>
        <div className="icon" onClick={() => setOpenCodeRunner(true)}>
          <div className="icon-img">⚡</div>
          <span>Code Runner</span>
        </div>
      </div>

      {/* Resizable Terminal Window */}
      {openTerminal && (
        <div className="window resizable-window terminal-window">
          <div className="window-header">
            <span>nirob@silent-killer-bash</span>
            <button className="close-btn" onClick={() => setOpenTerminal(false)}></button>
          </div>
          <div className="window-body terminal-body">
            <LinuxTerminal />
          </div>
        </div>
      )}

      {/* Resizable Hacker AI Window */}
      {openHackerAI && (
        <div className="window resizable-window hacker-ai-window">
          <div className="window-header">
            <span>Hacker AI</span>
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

      {/* Resizable OnlineGDB Window */}
      {openCodeRunner && (
        <div className="window resizable-window coderunner-window">
          <div className="window-header">
            <span>OnlineGDB - Code Runner & Debugger</span>
            <div className="header-actions">
              <a href="https://www.onlinegdb.com/" target="_blank" rel="noreferrer" className="external-link">
                Open External ↗
              </a>
              <button className="close-btn" onClick={() => setOpenCodeRunner(false)}></button>
            </div>
          </div>
          <div className="window-body iframe-body">
            <iframe 
              src="https://www.onlinegdb.com/" 
              title="OnlineGDB Code Runner" 
              className="app-iframe" 
            />
          </div>
        </div>
      )}

      {/* Bottom Desktop Taskbar */}
      <div className="taskbar">
        <button className="start-btn" onClick={() => setOpenHackerAI(true)}>
          🤖 Hacker AI
        </button>
        <button className="start-btn secondary" onClick={() => setOpenTerminal(true)}>
          💻 Terminal
        </button>
        <button className="start-btn secondary" onClick={() => setOpenCodeRunner(true)}>
          ⚡ Code Runner
        </button>
        <button className="lock-btn" onClick={() => setIsLocked(true)}>
          Lock OS
        </button>
        <span className="clock">{time}</span>
      </div>
    </div>
  );
}
