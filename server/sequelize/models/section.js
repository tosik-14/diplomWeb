// models/section.js
const { DataTypes } = require('sequelize');
const File = require('./file');
const sequelize = require('../config/sequelize');

const Section = sequelize.define('Section', {
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
            model: 'sections',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'sections',  //название таблицы в бд
    timestamps: false,
});

Section.hasMany(Section, { //Section имеет много Section, связаны по parent_id. Это для каскадного удаления
    foreignKey: 'parent_id',
    as: 'subfolders',
    onDelete: 'CASCADE',
});

Section.belongsTo(Section, {
    foreignKey: 'parent_id',
    as: 'parentFolder',
});

Section.hasMany(File, { //Section имеет много File, связаны по sectionId. Это для каскадного удаления
    foreignKey: 'sectionId',
    as: 'files',
    onDelete: 'CASCADE',
});

File.belongsTo(Section, {
    foreignKey: 'sectionId',
    as: 'section',
});

module.exports = Section;
