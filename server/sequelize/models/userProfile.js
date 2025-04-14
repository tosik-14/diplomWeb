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
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,  // имя не бывает null
    },
    second_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    patronymic: {
        type: DataTypes.STRING,
        allowNull: true, //ну отчества может быть null
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
    university: {
        type: DataTypes.STRING,
    },
    city: {
        type: DataTypes.STRING,
    },
    profile_image: {
        type: DataTypes.STRING,  // путь до аватарки
    },
}, {
    tableName: 'user_profiles',  // название таблицы в БД
    timestamps: false,
});

UserProfile.associate = (models) => {
    UserProfile.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user', // псевдоним для ассоциации
    });
};

module.exports = UserProfile;
