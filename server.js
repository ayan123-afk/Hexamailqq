// server.js
// Node 16+ recommended. Run: npm init -y && npm install express body-parser nodemailer
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json()); // for JSON webhooks
app.use(bodyParser.urlencoded({ extended: true })); // for form webhooks

const DB_FILE = path.join(__dirname, 'messages.json');
function load() {
  try { return JSON.parse(fs.readFileSync(DB_FILE,'utf8')); } catch(e){ return []; }
}
function save(arr){ fs.writeFileSync(DB_FILE, JSON.stringify(arr, null, 2)); }

// Webhook endpoint for inbound emails (Mailgun / SendGrid inbound parse style)
app.post('/webhook/inbound', (req, res) => {
  // Mailgun posts form fields like: from, subject, sender, recipient, body-plain, body-html
  const msg = {
    id: Date.now().toString(),
    from: req.body.from || req.body.sender || 'unknown',
    to: req.body.to || req.body.recipient || req.body['recipient[]'] || 'unknown',
    subject: req.body.subject || '(no subject)',
    text: req.body['body-plain'] || req.body.text || req.body.body || '',
    html: req.body['body-html'] || '',
    headers: req.body['message-headers'] || {},
    receivedAt: new Date().toISOString()
  };
  const arr = load();
  arr.unshift(msg); // newest first
  save(arr);
  res.status(200).send('OK');
});

// API: list messages (optionally filter by recipient)
app.get('/api/messages', (req, res) => {
  const r = req.query.to;
  let arr = load();
  if (r) arr = arr.filter(m => (m.to||'').includes(r));
  res.json(arr);
});

// API: get single message
app.get('/api/messages/:id', (req, res) => {
  const arr = load();
  const m = arr.find(x => x.id === req.params.id);
  if (!m) return res.status(404).send('Not found');
  res.json(m);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log('Server listening on', PORT));
