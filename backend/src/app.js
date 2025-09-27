const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const authRoutes = require('./routes/auth')
const taskRoutes = require('./routes/tasks')
const userRoutes = require('./routes/users')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const FRONTEND = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
app.use(cors({ origin: FRONTEND, credentials: true }))

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/users', userRoutes)

app.use((req, res) => res.status(404).json({ message: 'Not Found' }))
app.use(errorHandler)

module.exports = app
