const express = require('express')
const { body } = require('express-validator')
const auth = require('../middlewares/authMiddleware')
const ctrl = require('../controllers/taskController')

const router = express.Router()

router.use(auth)

// list / create
router.get('/', ctrl.listTasks)
router.post('/',
  [
    body('title').notEmpty().withMessage('Title required'),
    body('priority').optional().isIn(['HIGH','MEDIUM','LOW']),
    body('status').optional().isIn(['PENDING','COMPLETED']),
    body('dueDate').optional().isISO8601().toDate()
  ],
  ctrl.createTask
)

// specific task
router.get('/:id', ctrl.getTask)
router.put('/:id',
  [
    body('title').optional().notEmpty(),
    body('priority').optional().isIn(['HIGH','MEDIUM','LOW']),
    body('status').optional().isIn(['PENDING','COMPLETED']),
    body('dueDate').optional().isISO8601().toDate()
  ],
  ctrl.updateTask
)

router.delete('/:id', ctrl.deleteTask)

// quick patches
router.patch('/:id/status', [ body('status').exists() ], ctrl.patchStatus)
router.patch('/:id/priority', [ body('priority').exists() ], ctrl.patchPriority)

module.exports = router
