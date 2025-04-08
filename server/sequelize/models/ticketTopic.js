// models/ticketTopic.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const TicketTopic = sequelize.define('TicketTopic', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    ticketId: {
        type: DataTypes.UUID,
        references: {
            model: 'tickets',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    topic: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'ticket_topics',  //название таблицы в бд
    timestamps: false,
});

module.exports = TicketTopic;
