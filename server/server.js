
require('dotenv').config();
require('dns').setDefaultResultOrder('ipv4first');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/campaigns', require('./routes/campaign.routes'));


app.use((req, res) => res.status(404).json({ message: 'No such route.' }));


app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: 'Something went wrong on our end.' });
});

const connectDB = require('./config/db');
const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
});