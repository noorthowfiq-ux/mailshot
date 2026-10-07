require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

app.use('/api/campaigns', require('./routes/campaign.routes'));

// anything that didn't match a route
app.use((req, res) => res.status(404).json({ message: 'No such route.' }));

// last-resort error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: 'Something went wrong on our end.' });
});

const connectDB = require('./config/db');
const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
});