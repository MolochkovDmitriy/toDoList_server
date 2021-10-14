const Router = require('express')
const taskController = require('../controllers/taskController')
const router = new Router()

router.post('/task', taskController.create) 
router.post('/task/updateone', taskController.update)
router.delete('/task/deleteone', taskController.deleteOne)
router.delete('/task/deletechecked', taskController.deleteChecked)
router.delete('/task/deleteall', taskController.deleteAll)
router.get('/task/all', taskController.getAll)
router.get('/task/completed', taskController.getCompleted)
router.get('/task/uncompleted', taskController.getUncompleted)
router.get('/task/count', taskController.getCountOfTasks)


module.exports = router