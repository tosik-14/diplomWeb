//const db = require('../db');
const { Section, File } = require('../sequelize/models'); // Импортируем модель Section
const authenticateToken = require('../middleware/authenticateToken');
const {as} = require("pg-promise");
const fs = require('fs');
const path = require('path');

const getUserFolders = async (req, res) => { // получение папок пользователя с помощью parentId
    try {
        const userId = req.user.userId;
        const parentId = req.query.parentId;

        //console.log("REQUEST: ", req.user.userId, req.query.parentId);
        let queryOptions = {
            where: { user_id: userId },
            attributes: ['id', 'name', 'parent_id'], //какие поля нужны(еще бы добавить сюда время создания ммм)
        };

        if (parentId === 'null') { // в случае если пользователь запрашивает корневые папки
            queryOptions.where.parent_id = null;
        } else if (parentId) { // во всех остальных случаях
            queryOptions.where.parent_id = parentId; // Получение дочерних папок
        }

        const folders = await Section.findAll(queryOptions); //запрашиваем папки
        //console.log("FOLDERS: ", folders);
        res.json(folders); //ответ

    } catch (error) {
        console.error('ошибка при получении папок:', error);
        res.status(500).send('ошибка сервера');
    }
};

const createFolder = async (req, res) => {
    const { name, parentId } = req.body;
    const userId = req.user.userId;

    /*console.log("CREATE FOLDER START, PARENT ID: ", parentId);
    if (name === 'f'){
        return res.status(400).json({ message: 'test' });
    }*/
    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Пустое название папки' });
    }

    try {
        const existingFolder = await Section.findOne({ //проверяем чтобы в этой папке не было таких же папок
            where: {
                name,
                parentId: parentId || null,
                userId,
            },
        });

        if (existingFolder) {
            return res.status(400).json({ message: 'папка с таким именем уже существует' });
        }

        const newFolder = await Section.create({ //создание папки
            name,
            parentId: parentId || null,
            userId,
        });

        res.status(201).json({ //ответ
            id: newFolder.id,
            name: newFolder.name,
            parentId: newFolder.parentId,
            userId: newFolder.userId,
            createdAt: newFolder.createdAt,
        });
    } catch (err) {
        console.error('ошибка создания папки:', err);
        res.status(500).json({ message: 'ошибка сервера при создании папки' });
    }
};


const renameFolder = async (req, res) => { // переименовать папку
    const { folderId, newFolderName, parentId} = req.body;

    //console.log("FOLDER IDm, NEW FOLDER NAME, PARENT ID: ",folderId, newFolderName, parentId);

    if (!newFolderName || newFolderName.trim() === '') {
        return res.status(400).json({ message: 'пустое название папки' });
    }
    try {
        const existingFolder = await Section.findOne({ //проверяем чтобы в этой папке не было таких же папок
            where: {
                name: newFolderName,
                parentId: parentId || null,  // вообще parentId не может не быть, но на всякий
            },
        });

        if (existingFolder) {
            return res.status(400).json({ message: 'папка с таким именем уже существует' });
        }

        await Section.update(   //обновляем название
            { name: newFolderName },
            { where: { id: folderId } }
        );

        res.status(200).json({ message: 'имя папки изменено' });

    } catch (error) {
        console.error('ошибка, не удалось переименовать:', error);
        res.status(500).json({ message: 'ошибка сервера при смене имени папки.' });
    }
};

const moveItems = async (req, res) => { // перемещение папок и файлов
    const { folderIds = [], fileIds = [], targetFolderId } = req.body; //{id папок, id файлов, id папки, куда хотим переместить}

    try {
        if (folderIds.length > 0 && targetFolderId) {
            const nestedIds = await getAllNestedFolderIds(folderIds); //рекурсивная функция(описана ниже) для выявления всех вложенных папок
            if (nestedIds.includes(targetFolderId)) { // ищем среди всех вложенных папок ту, в которую хотим переместить(если найдет, функция остановит работу)
                return res.status(400).json({ message: 'НЕЛЬЗЯ переместить папку ВНУТРЬ СЕБЯ или ее вложенных папок' });
            }
        }

        if (fileIds.length > 0) { //обновляем sectionId для файлов при перемещении
            await File.update(
                { sectionId: targetFolderId },
                { where: { id: fileIds } }
            );
        }

        if (folderIds.length > 0) { //обновляем parentId для папок при перемещении
            await Section.update(
                { parentId: targetFolderId },
                { where: { id: folderIds } }
            );
        }

        res.json({ message: 'файлы/папки перемещены' });
    } catch (err) {
        console.error('ошибка при перемещении:', err);
        res.status(500).json({ message: 'ошибка при перемещении' });
    }
};

//////////// УДАЛЕНИЕ ////// оно такое огромное, потому что при удалении папки, нужно удалить вложенные файлы с диска. /////////
//////////// каскадное удаление в базе данных не способно удалить файлы, которые находятся на диске.

const getAllNestedFolderIds = async (initialIds) => { // тут рекурсивно в result записываются айди всех папок внутри удаляемой папки
    const result = new Set(initialIds);               // и еще эта функция импользуется в moveItems выше

    const findChildren = async (parentIds) => { // поиск дочерних папок
        const children = await Section.findAll({
            where: { parentId: parentIds },
            attributes: ['id']
        });

        const childIds = children.map(child => child.id); //создаем массив из id дочерних папок
        childIds.forEach(id => result.add(id)); // записываем в result id дочерних папок по отдельности

        if (childIds.length > 0) { // если внутри еще есть папки, функция вызывает саму себя, создавая рекурсию
            await findChildren(childIds);
        }
    };

    await findChildren(initialIds); // первый вызов рекурсивной функции
    return Array.from(result);
};


const getAllFilesByFolderIds = async (folderIds) => {  //здесь возвращаются файлы внутри удаляемой папки/папок
    return await File.findAll({
        where: {
            sectionId: folderIds
        },
        attributes: ['filePath']
    });
};

const deleteFilesFromDisk = (files) => {   //файлы удаляются с диска, по пути
    files.forEach(file => {
        const fullPath = path.resolve(file.filePath); //тут мы делаем из пути который в бд полный путь от корня
        try {
            fs.unlinkSync(fullPath);
            //console.log("DELETED FILE FULL PATH: ", fullPath);
        } catch (err) {
            console.warn(`не удалось удалить файл: ${fullPath}`, err.message);
        }
    });
};


const deleteFolder = async (req, res) => {
    try {
        const { folderIds } = req.body;

        if (!Array.isArray(folderIds) || folderIds.length === 0) {
            return res.status(400).json({ message: 'нет папок для удаления.' });
        }

        const allFolderIds = await getAllNestedFolderIds(folderIds); // лутаем все айди всех вложенных папок

        const files = await getAllFilesByFolderIds(allFolderIds); // лутаем все файлы

        if (files.length > 0) deleteFilesFromDisk(files); // удаляем файлы, ну если есть что удалять конечно
        // цирк с конями, но по другому никак по сути, только если хранить файлы в самой бд, но это может вызвать
        // трудности с нагрузкой на бд, ведь файлы вес имеют
        await Section.destroy({ // удаление папки в бд. Всё остальное в бд удаляется каскадно
            where: {
                id: folderIds,
            },
        });

        res.json({ message: 'папки удалены.' });
    } catch (error) {
        console.error('ошибка удаления папок:', error);
        res.status(500).json({ message: 'ошибка сервера во время удалении папок.' });
    }
};



module.exports = {
    getUserFolders,
    createFolder,
    deleteFolder,
    renameFolder,
    moveItems
};