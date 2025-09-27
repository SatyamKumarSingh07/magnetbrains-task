const express = require('express')
const { body } = require('express-validator')
const auth = require('../middlewares/authMiddleware')
const { isAdmin } = require('../middlewares/authMiddleware')
const User = require('../models/User')
const bcrypt = require('bcryptjs')

const router = express.Router()

router.use(auth)
router.use(isAdmin) // admin only

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    console.error('list users', err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['user','admin'])
], async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already used' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash, role: role || 'user' })
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role })
  } catch (err) {
    console.error('create user', err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const u = await User.findById(req.params.id)
    if (!u) return res.status(404).json({ message: 'Not found' })
    await User.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    console.error('delete user', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
