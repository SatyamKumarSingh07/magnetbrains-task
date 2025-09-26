const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: allow your frontend origin (set FRONTEND_ORIGIN in env)
const FRONTEND = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND, credentials: true }));

// health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// main routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// fallback
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

// error handler
app.use(errorHandler);

module.exports = app;
