// models/file.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const File = sequelize.define('File', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    sectionId: {
        type: DataTypes.UUID,
        references: {
            model: 'sections', //папка в которой файл находится в этой таблице
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    uploadedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    userId: {
        type: DataTypes.UUID,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
}, {
    tableName: 'files',  //название таблицы в бд
    timestamps: false,
});

module.exports = File;
