// backend/controllers/taskController.js
const { validationResult } = require('express-validator')
const Task = require('../models/Task')

// List tasks (simple pagination + optional q)
// Replace exports.listTasks with this code
exports.listTasks = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.max(1, parseInt(req.query.limit) || 20)
    const q = req.query.q ? req.query.q.trim() : ''

    // Build filter: only tasks created by the current user
    const filter = { createdBy: req.user._id }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }

    const total = await Task.countDocuments(filter)
    const docs = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email')

    res.json({ data: docs, page, pages: Math.ceil(total / limit), total })
  } catch (err) {
    console.error('listTasks', err)
    res.status(500).json({ message: 'Server error' })
  }
}


// Get single task
exports.getTask = async (req, res) => {
  try {
    const t = await Task.findById(req.params.id).populate('createdBy', 'name email')
    if (!t) return res.status(404).json({ message: 'Not found' })
    res.json(t)
  } catch (err) {
    console.error('getTask', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// Create
exports.createTask = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() })

    const { title, description, dueDate, priority, status, assignedTo } = req.body
    const task = await Task.create({
      title,
      description: description || '',
      dueDate: dueDate || null,
      priority: priority || 'MEDIUM',
      status: status || 'PENDING',
      assignedTo: assignedTo || null,
      createdBy: req.user._id
    })

    const populated = await task.populate('createdBy', 'name email')
    res.status(201).json(populated)
  } catch (err) {
    console.error('createTask', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// Update (full edit via PUT)
exports.updateTask = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() })

    const t = await Task.findById(req.params.id)
    if (!t) return res.status(404).json({ message: 'Not found' })

    // ownership check
    if (t.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const { title, description, dueDate, priority, status, assignedTo } = req.body

    if (title !== undefined) t.title = title
    if (description !== undefined) t.description = description
    if (dueDate !== undefined) t.dueDate = dueDate
    if (priority !== undefined) t.priority = priority
    if (status !== undefined) t.status = status
    if (assignedTo !== undefined) t.assignedTo = assignedTo

    await t.save()

    const populated = await t.populate('createdBy', 'name email')
    res.json(populated)
  } catch (err) {
    console.error('updateTask', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// Delete
// backend/controllers/taskController.js
// backend/controllers/taskController.js
exports.deleteTask = async (req, res) => {
  try {
    const t = await Task.findById(req.params.id)
    if (!t) return res.status(404).json({ message: 'Not found' })

    // make sure req.user exists (auth middleware should set it)
    if (!req.user) {
      console.error('deleteTask: missing req.user (auth failure)')
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // if createdBy is missing or not equal -> forbid
    if (!t.createdBy || t.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    // use model-level delete to avoid "remove is not a function" issues
    await Task.findByIdAndDelete(t._id)

    return res.json({ ok: true })
  } catch (err) {
    console.error('deleteTask error:', err)
    return res.status(500).json({ message: 'Server error', error: err.message })
  }
}


// Patch status
exports.patchStatus = async (req, res) => {
  try {
    const t = await Task.findById(req.params.id)
    if (!t) return res.status(404).json({ message: 'Not found' })

    if (t.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const { status } = req.body
    if (!['PENDING', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    t.status = status
    await t.save()
    const populated = await t.populate('createdBy', 'name email')
    res.json(populated)
  } catch (err) {
    console.error('patchStatus', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// Patch priority
exports.patchPriority = async (req, res) => {
  try {
    const t = await Task.findById(req.params.id)
    if (!t) return res.status(404).json({ message: 'Not found' })

    if (t.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const { priority } = req.body
    if (!['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority' })
    }

    t.priority = priority
    await t.save()
    const populated = await t.populate('createdBy', 'name email')
    res.json(populated)
  } catch (err) {
    console.error('patchPriority', err)
    res.status(500).json({ message: 'Server error' })
  }
}
