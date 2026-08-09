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

// Serve static assets from Vite build
app.use(express.static(path.join(__dirname, 'dist')));

// WebSocket Terminal Handler
wss.on('connection', (ws) => {
  const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME || process.cwd(),
    env: process.env
  });

  ptyProcess.onData((data) => {
    try {
      ws.send(data);
    } catch (e) {}
  });

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
