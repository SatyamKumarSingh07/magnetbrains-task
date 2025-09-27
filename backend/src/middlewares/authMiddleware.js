// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken')
const User = require('../models/User') // adjust path if different

const secret = process.env.JWT_SECRET || 'dev_secret'

module.exports = async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, secret)
    if (!decoded?.id) return res.status(401).json({ message: 'Unauthorized' })

    const user = await User.findById(decoded.id).select('-passwordHash')
    if (!user) return res.status(401).json({ message: 'Unauthorized' })

    req.user = user
    next()
  } catch (err) {
    console.error('Auth error', err)
    return res.status(401).json({ message: 'Unauthorized' })
  }
}
