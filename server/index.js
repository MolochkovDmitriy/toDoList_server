require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const models = require('./models/models')
const cors = require('cors') //для запросов к БД из браузера
const router = require('./routes/index')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const path = require('path')
const static = path.join(__dirname, '..', 'client')


const PORT = process.env.PORT || 5000


const app = express()
app.use(cors())
app.use(express.json())
app.use('/', router)
app.use(express.static(static))
app.use(errorHandler)
app.get('/', (req, res)=> {res.sendFile(static + 'index')})


const start = async () => {
    try {
        await sequelize.authenticate() //авторизация в БД
        await sequelize.sync() // сверка БД со схемой БД в программе
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()

