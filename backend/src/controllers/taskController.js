const { validationResult } = require('express-validator')
const Task = require('../models/Task')
const mongoose = require('mongoose')

// list tasks: admins see all; normal users see tasks they created OR assigned to them
exports.listTasks = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.max(1, parseInt(req.query.limit) || 20)
    const q = req.query.q ? req.query.q.trim() : ''

    const filter = {}
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }

    if (req.user.role !== 'admin') {
      // show tasks created by the user OR assigned to the user
      filter.$or = filter.$or || []
      filter.$or.push({ createdBy: req.user._id }, { assignedTo: req.user._id })
    }

    const total = await Task.countDocuments(filter)
    const docs = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')

    res.json({ data: docs, page, pages: Math.ceil(total / limit), total })
  } catch (err) {
    console.error('listTasks', err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.getTask = async (req, res) => {
  try {
    const t = await Task.findById(req.params.id).populate('createdBy', 'name email role').populate('assignedTo', 'name email role')
    if (!t) return res.status(404).json({ message: 'Not found' })

    // enforce visibility: creator, assignee or admin can view
    if (req.user.role !== 'admin' && t.createdBy._id.toString() !== req.user._id.toString() && (!t.assignedTo || t.assignedTo._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    res.json(t)
  } catch (err) {
    console.error('getTask', err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.createTask = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() })

    let { title, description, dueDate, priority, status, assignedTo } = req.body

    // validate assignedTo if provided
    if (assignedTo && !mongoose.isValidObjectId(assignedTo)) assignedTo = null

    // Non-admins cannot assign tasks to other users — allow them to set assignedTo to themselves only
    if (assignedTo && req.user.role !== 'admin') {
      if (assignedTo.toString() !== req.user._id.toString()) assignedTo = req.user._id
    }

    const task = await Task.create({
      title,
      description: description || '',
      dueDate: dueDate || null,
      priority: priority || 'MEDIUM',
      status: status || 'PENDING',
      assignedTo: assignedTo || null,
      createdBy: req.user._id
    })

    const populated = await Task.findById(task._id).populate('createdBy', 'name email role').populate('assignedTo', 'name email role')
    res.status(201).json(populated)
  } catch (err) {
    console.error('createTask', err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.updateTask = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() })

    const t = await Task.findById(req.params.id)
    if (!t) return res.status(404).json({ message: 'Not found' })

    // only creator or admin can edit (we keep this conservative)
    if (t.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const { title, description, dueDate, priority, status, assignedTo } = req.body

    if (assignedTo && !mongoose.isValidObjectId(assignedTo)) {
      // ignore invalid assignedTo
    } else if (assignedTo) {
      // admin can assign to anyone; creator can assign only to themselves
      if (req.user.role === 'admin' || assignedTo.toString() === req.user._id.toString()) {
        t.assignedTo = assignedTo
      }
    }

    if (title !== undefined) t.title = title
    if (description !== undefined) t.description = description
    if (dueDate !== undefined) t.dueDate = dueDate
    if (priority !== undefined) t.priority = priority
    if (status !== undefined) t.status = status

    await t.save()
    const populated = await Task.findById(t._id).populate('createdBy', 'name email role').populate('assignedTo', 'name email role')
    res.json(populated)
  } catch (err) {
    console.error('updateTask', err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.deleteTask = async (req, res) => {
  try {
    const t = await Task.findById(req.params.id)
    if (!t) return res.status(404).json({ message: 'Not found' })

    if (!req.user) {
      console.error('deleteTask: missing req.user')
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // allow delete by creator or admin
    if (t.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    await Task.findByIdAndDelete(t._id)
    return res.json({ ok: true })
  } catch (err) {
    console.error('deleteTask error:', err)
    return res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Patch status - allow creator OR assigned user OR admin
exports.patchStatus = async (req, res) => {
  try {
    const t = await Task.findById(req.params.id)
    if (!t) return res.status(404).json({ message: 'Not found' })

    const allowed = t.createdBy.toString() === req.user._id.toString() ||
                    (t.assignedTo && t.assignedTo.toString() === req.user._id.toString()) ||
                    req.user.role === 'admin'
    if (!allowed) return res.status(403).json({ message: 'Forbidden' })

    const { status } = req.body
    if (!['PENDING', 'COMPLETED'].includes(status)) return res.status(400).json({ message: 'Invalid status' })

    t.status = status
    await t.save()
    const populated = await Task.findById(t._id).populate('createdBy', 'name email role').populate('assignedTo', 'name email role')
    res.json(populated)
  } catch (err) {
    console.error('patchStatus', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// Patch priority - allow creator or admin
exports.patchPriority = async (req, res) => {
  try {
    const t = await Task.findById(req.params.id)
    if (!t) return res.status(404).json({ message: 'Not found' })

    if (t.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const { priority } = req.body
    if (!['HIGH', 'MEDIUM', 'LOW'].includes(priority)) return res.status(400).json({ message: 'Invalid priority' })

    t.priority = priority
    await t.save()
    const populated = await Task.findById(t._id).populate('createdBy', 'name email role').populate('assignedTo', 'name email role')
    res.json(populated)
  } catch (err) {
    console.error('patchPriority', err)
    res.status(500).json({ message: 'Server error' })
  }
}
