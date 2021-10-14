const { Task } = require('../models/models')
const ApiError = require('../error/ApiError')
class TaskController {
    async create(req, res, next) {
        try {
            const { content, color } = req.body
            const task = await Task.create({ content, color })
            return res.json(task)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res) {
        let { limit, page } = req.query
        page = page || 1
        limit = limit || 5
        let offset = page * limit - limit
        const tasks = await Task.findAndCountAll({ limit, offset, order: [['id', 'ASC']]})
        console.log(req.query.id)
        return res.json(tasks)
    }

    async getCompleted(req, res) {
        let { limit, page } = req.query
        page = page || 1
        limit = limit || 5
        let offset = page * limit - limit
        const tasks = await Task.findAndCountAll({ where: { completed: true }, limit, offset, order: [['id', 'ASC']] })
        return res.json(tasks)
    }

    async getUncompleted(req, res) {
        let { limit, page } = req.query
        page = page || 1
        limit = limit || 5
        let offset = page * limit - limit
        const tasks = await Task.findAndCountAll({ where: { completed: false }, limit, offset, order: [['id', 'ASC']] })
        return res.json(tasks)
    }

    async getCountOfTasks(req, res) {
        const countCompleted = await Task.count({ where: { completed: true } })
        const countUncompleted = await Task.count({ where: { completed: false } })
        const countAll = countCompleted + countUncompleted;
        return res.json({ countCompleted, countUncompleted, countAll })
    }

    async deleteOne(req, res, next) {
        try {
            const { id } = req.query
            await Task.destroy({ where: { id } })
            return res.send('Задача удалена')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async deleteChecked(req, res, next) {
        try {
            await Task.destroy({ where: { completed: true } })
            return res.send('Задачи удалены')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async deleteAll(req, res, next) {
        try {
            await Task.destroy({where:{}})
            return res.send('Задачи удалены')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.query
            const { content, completed, color } = req.body
            await Task.update({
                content, completed, color
            },
            {
                where: { id }
            })
            return res.send('Запись обновлена')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new TaskController()