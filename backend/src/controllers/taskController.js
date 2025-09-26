const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const { getPagination } = require('../utils/paginate');

const listTasks = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    // optional filters
    if(req.query.priority) filter.priority = req.query.priority;
    if(req.query.status) filter.status = req.query.status;
    if(req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if(req.query.mine === 'true') filter.createdBy = req.user._id;

    if(req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };

    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      data: tasks,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });

    const data = req.body;
    data.createdBy = req.user._id;
    const task = new Task(data);
    await task.save();

    const populated = await Task.findById(task._id).populate('assignedTo', 'name email').populate('createdBy', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email').populate('createdBy', 'name email');
    if(!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });

    const task = await Task.findById(req.params.id);
    if(!task) return res.status(404).json({ message: 'Task not found' });

    // Optionally restrict edits to creator only - currently allow any authenticated user
    Object.assign(task, req.body);
    await task.save();

    const populated = await Task.findById(task._id).populate('assignedTo', 'name email').populate('createdBy', 'name email');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if(!task) return res.status(404).json({ message: 'Task not found' });

    await task.remove();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

const patchStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if(!['PENDING','COMPLETED'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const task = await Task.findById(req.params.id);
    if(!task) return res.status(404).json({ message: 'Task not found' });

    task.status = status;
    await task.save();

    const populated = await Task.findById(task._id).populate('assignedTo', 'name email').populate('createdBy', 'name email');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

const patchPriority = async (req, res, next) => {
  try {
    const { priority } = req.body;
    if(!['HIGH','MEDIUM','LOW'].includes(priority)) return res.status(400).json({ message: 'Invalid priority' });

    const task = await Task.findById(req.params.id);
    if(!task) return res.status(404).json({ message: 'Task not found' });

    task.priority = priority;
    await task.save();

    const populated = await Task.findById(task._id).populate('assignedTo', 'name email').populate('createdBy', 'name email');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  patchStatus,
  patchPriority
};
