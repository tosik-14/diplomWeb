// models/userProfile.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const UserProfile = sequelize.define('UserProfile', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    userId: {
        type: DataTypes.UUID,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    faculty: {
        type: DataTypes.STRING,
    },
    position: {
        type: DataTypes.STRING,
    },
    bio: {
        type: DataTypes.TEXT,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'user_profiles',  //название таблицы в бд
    timestamps: false,
});

UserProfile.associate = (models) => {
    UserProfile.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user', // псевдоним для ассоциации
    });
};

module.exports = UserProfile;
