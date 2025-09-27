const jwt = require('jsonwebtoken')
const User = require('../models/User')
const secret = process.env.JWT_SECRET || 'dev_secret'

async function auth(req, res, next) {
  try {
    const h = req.headers.authorization
    if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' })
    const token = h.split(' ')[1]
    const decoded = jwt.verify(token, secret)
    if (!decoded?.id) return res.status(401).json({ message: 'Unauthorized' })
    const user = await User.findById(decoded.id).select('-passwordHash')
    if (!user) return res.status(401).json({ message: 'Unauthorized' })
    req.user = user
    return next()
  } catch (err) {
    console.error('Auth error', err)
    return res.status(401).json({ message: 'Unauthorized' })
  }
}

function isAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: admin only' })
  return next()
}

module.exports = auth
module.exports.isAdmin = isAdmin
