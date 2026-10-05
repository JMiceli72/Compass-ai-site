const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'signups.json');

app.use(express.json());
app.use(express.static(__dirname));

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

app.post('/api/signup', (req, res) => {
  try {
    const { name, email, trade, location, lang } = req.body || {};
    if (!name || !email || !trade || !location) {
      return res.status(400).json({ ok: false, error: 'Please fill in every field.' });
    }
    const signups = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    signups.push({ name, email, trade, location, lang: lang || 'English', submittedAt: new Date().toISOString() });
    fs.writeFileSync(DATA_FILE, JSON.stringify(signups, null, 2));
    res.json({ ok: true });
  } catch (err) {
    console.error('Signup save failed:', err);
    res.status(500).json({ ok: false, error: 'Something went wrong on our end. Please try again.' });
  }
});

app.get('/api/signups', (req, res) => {
  if (!process.env.ADMIN_KEY || req.query.key !== process.env.ADMIN_KEY) {
    return res.status(403).send('Forbidden');
  }
  res.json(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
});

app.listen(PORT, () => console.log(
