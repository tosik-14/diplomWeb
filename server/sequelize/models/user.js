// models/user.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'users', //название таблицы в бд
    timestamps: false,
});

User.associate = (models) => {
    User.hasOne(models.UserProfile, { //каждый User имеет один UserProfile
        foreignKey: 'user_id', // это внешний ключ в таблице профилей
        as: 'profile', // псевдоним для ассоциации
    });
};

module.exports = User;
