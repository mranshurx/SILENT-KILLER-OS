import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import pty from 'node-pty';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Serve Vite Static Build
app.use(express.static(path.join(__dirname, 'dist')));

// WebSocket Terminal Handler
wss.on('connection', (ws) => {
  // Spawn Real Linux Shell Process
  const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env
  });

  // Pipe stdout from Shell to WebSocket
  ptyProcess.onData((data) => {
    try {
      ws.send(data);
    } catch (e) {}
  });

  // Pipe stdin from WebSocket to Shell
  ws.on('message', (msg) => {
    try {
      ptyProcess.write(msg.toString());
    } catch (e) {}
  });

  ws.on('close', () => {
    ptyProcess.kill();
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`[SILENT KILLER OS] Server active on port ${PORT}`);
});
