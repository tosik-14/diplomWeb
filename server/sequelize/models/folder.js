// models/folder.js
const { DataTypes } = require('sequelize');
const File = require('./file');
const sequelize = require('../config/sequelize');

const Folder = sequelize.define('Folder', {
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
    parentId: {
        type: DataTypes.UUID,
        references: {
            model: 'folders',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'folders',  //название таблицы в бд
    timestamps: false,
});

Folder.hasMany(Folder, { //Folder имеет много Folder, связаны по parent_id. Это для каскадного удаления
    foreignKey: 'parent_id',
    as: 'subfolders',
    onDelete: 'CASCADE',
});

Folder.belongsTo(Folder, {
    foreignKey: 'parent_id',
    as: 'parentFolder',
});

Folder.hasMany(File, { //Folder имеет много File, связаны по sectionId. Это для каскадного удаления
    foreignKey: 'folderId',
    as: 'files',
    onDelete: 'CASCADE',
});

File.belongsTo(Folder, {
    foreignKey: 'folderId',
    as: 'folder',
});

module.exports = Folder;
