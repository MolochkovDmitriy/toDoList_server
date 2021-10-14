const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const Task = sequelize.define( 'task', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    content: {type: DataTypes.TEXT},
    completed: {type: DataTypes.BOOLEAN, defaultValue: false},
    color: {type: DataTypes.STRING}
})

module.exports = {
    Task
}