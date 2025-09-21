const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up LowDB database with FileSync adapter
const file = path.join(__dirname, 'db.json');
const adapter = new FileSync(file);
const db = lowdb(adapter);

// Initialize the DB with default data if not present
if (!db.has('calculations').value()) {
  db.set('calculations', []).write();
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve frontend files

// Endpoint to save calculation
app.post('/calculate', (req, res) => {
  const { expression, result } = req.body;
  if (!expression || result === undefined) {
    return res.status(400).send({ error: 'Invalid payload' });
  }
  db.get('calculations').push({ expression, result, timestamp: Date.now() }).write();
  res.status(200).send({ message: 'Calculation saved' });
});

// Endpoint to get history
app.get('/history', (req, res) => {
  const items = db.get('calculations').value();
  // return in reverse order (latest first)
  res.status(200).send(items.slice().reverse());
});

// Endpoint to clear calculation history
app.post('/clear-history', (req, res) => {
  db.set('calculations', []).write();
  res.status(200).send({ message: 'History cleared' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
