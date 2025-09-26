const express = require('express');
const { body, param } = require('express-validator');
const auth = require('../middlewares/authMiddleware');
const {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  patchStatus,
  patchPriority
} = require('../controllers/taskController');

const router = express.Router();

// all routes protected
router.use(auth);

// list / create
router.get('/', listTasks);
router.post('/',
  [
    body('title').notEmpty().withMessage('Title required'),
    body('priority').optional().isIn(['HIGH','MEDIUM','LOW']),
    body('status').optional().isIn(['PENDING','COMPLETED']),
    body('dueDate').optional().isISO8601().toDate()
  ],
  createTask
);

// specific task
router.get('/:id', getTask);
router.put('/:id',
  [
    body('title').optional().notEmpty(),
    body('priority').optional().isIn(['HIGH','MEDIUM','LOW']),
    body('status').optional().isIn(['PENDING','COMPLETED']),
    body('dueDate').optional().isISO8601().toDate()
  ],
  updateTask
);

router.delete('/:id', deleteTask);

// quick patches
router.patch('/:id/status', [ body('status').exists() ], patchStatus);
router.patch('/:id/priority', [ body('priority').exists() ], patchPriority);

module.exports = router;
