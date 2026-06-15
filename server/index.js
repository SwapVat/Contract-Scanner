const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests, please try again later.' }
});

// Routes
const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/scan');
const contractRoutes = require('./routes/contracts');

app.use('/api/auth', authRoutes);
app.use('/api/scan', scanLimiter, scanRoutes);
app.use('/api/contracts', contractRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Contract Scanner API is running 🚀' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});