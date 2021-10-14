const Router = require('express')
const router = new Router()
const taskRouter = require('./taskRouter')

router.use('/', taskRouter)

module.exports = router