const { File, Section} = require('../sequelize/models');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');


const getFilesBySection = async (req, res) => { // получение всех файлов, которые находятся в parentId папке
        try {
            const { parentId } = req.query;
            const files = await File.findAll({ where: { section_id: parentId } });
            res.json(files);
        } catch (error) {
            console.error('ERROR while GET file: ', error);
            res.status(500).json({ message: 'Server error while get file' });
        }
};


const uploadFile = async (req, res) => { // загрузить файл
    try {
        const { sectionId } = req.body;
        const file = req.file;
        const userId = req.user.userId;

        if (!file) {
            return res.status(400).json({ message: 'Файл не был загружен.' });
        }

        const cleanFileName = file.decodedOriginalName || file.originalname; //если есть раскодированное имя, которое есть из-за
                                                                             //русских названий, то берем его

        const existingFile = await File.findOne({ // проверка существует ли уже такой файл
            where: {
                fileName: cleanFileName, //проверяем по логическому имени. из папки сервера имена не отображаются и они всегда уникальны
                sectionId: sectionId,      // проверяем файлы с одним sectionId
                userId: userId,            // проверяем по userId на всякий
            }
        });

        if (existingFile) {
            return res.status(400).json({ message: 'файл с таким именем уже существует' });
        }

        const normalizedPath = file.path.replace(/\\/g, '/'); // меняем в пути к файлу \ на / для веб формата
        //console.log("FILENAME, FILEPATH: ", file.originalname, file.path);

        const newFile = await File.create({
            fileName: cleanFileName,
            filePath: normalizedPath,
            sectionId: sectionId,
            userId: userId,
        });

        res.json(newFile);  //ответ
    } catch (error) {
        console.error('ERROR while UPLOAD file:', error);
        res.status(500).json({ message: 'Server error while upload file' });
    }
};

const deleteFile = async (req, res) => { // удалить файлы если они не в папке, если удаляется папка с файлами, то вызывается контроллер из folderController
        try {
            //console.log("DELETE FILES REQ BODY: ", req.body);
            const { fileIds } = req.body;
            //console.log("FILES IDS", fileIds);

            if (!Array.isArray(fileIds) || fileIds.length === 0) {
                return res.status(400).json({ message: 'Нет файдлов для удаления.' });
            }

            const files = await File.findAll({ // ищем все файлы для удаления
                where: {
                    id: fileIds,
                },
            });

            files.forEach(file => { // удаляем каждый файл с диска(из папки сервера)
                const filePath = file.filePath; //путь из бд
                const fullFilePath = path.resolve(__dirname, '..', filePath);  //полный путь из компьютера + бд

                try {
                    fs.unlinkSync(fullFilePath);  //удаление
                    //console.log("DELETED FILE FULL FILE PATH:", fullFilePath);
                } catch (err) {
                    console.error(`Error while delete file: ${fullFilePath}:`, err);
                }
            });

            await File.destroy({ // только теперь удаление записей о файлах из бд
                where: {
                    id: fileIds,
                },
            });

            res.status(200).json({ message: 'файлы удалены' });
        } catch (error) {
            console.error('ERROR while DELETE file:', error);
            res.status(500).json({ message: 'Server error while delete archive' });
        }
};


const renameFile = async (req, res) => { // переименовать файл
        try {
            const { fileId } = req.body;
            const { newFilename } = req.body;

            const file = await File.findByPk(fileId);

            if (!file) {
                return res.status(404).json({ message: 'файл не найден.' });
            }

            file.fileName = newFilename;
            await file.save();

            res.json({ message: 'файл успешно переименован.' });
        } catch (error) {
            console.error('ERROR WHILE RENAME FILE:', error);
            res.status(500).json({ message: 'ошибка сервера при переименовании файла.' });
        }
};

const downloadFile = async (req, res) => {
    try {
        const { fileId } = req.query;

        const file = await File.findOne({ where: { id: fileId } });

        if (!file) {
            return res.status(404).json({ message: 'файл не найден' });
        }
        //console.log("FILE PATH: ", file.filePath);
        const filePath = path.resolve(__dirname, '..', file.filePath); //полный путь из компьютера + бд
        //console.log("FULL FILE PATH: ", filePath);
        //console.log("FILE NAME: ", file.fileName);

        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition'); //устанавливаем просматриваемые заголовки для передачи имени
        res.download(filePath, file.fileName, (err) => {
            if (err) {
                console.error('ошибка передачи файла для скачивания:', err);
                res.status(500).json({ message: 'ошибка сервера при передаче файла для скачивания' });
            }
        });
    } catch (error) {
        console.error('ERROR while download file: ', error);
        res.status(500).json({ message: 'Server error while download file' });
    }
};

const downloadArchiveFile = async (req, res) => { // скачивание нескольких файлов. Для этого используем архив
    try {
        const { fileIds } = req.body;

        if (!fileIds || fileIds.length === 0) {
            return res.status(400).json({ message: 'file ids not transferred' });
        }

        res.setHeader('Content-Type', 'application/zip');  //сами устанавлием заголовки. тут указано что передается архив
        res.setHeader('Content-Disposition', 'attachment'); //тут указано, что он для скачивания

        const zip = archiver('zip', { zlib: { level: 9 } }); //создается архив в оперативной памяти с левелом сжатия 9
        zip.pipe(res); // начинается стриминговый ответ. Архив сразу начинает передаваться клиенту, по частям

        for (const fileId of fileIds) { // в процессе передачи архива добавляем в него файлы
            const file = await File.findOne({ where: { id: fileId } });
            if (file && fs.existsSync(file.filePath)) {
                zip.append(fs.createReadStream(file.filePath), { name: file.fileName });
            }
        }

        await zip.finalize(); // после того, как всё упаковано в архив, он закрывается, так же закрывается поток ответа клиенту
    } catch (error) {
        console.error('ERROR while download archive: ', error);
        res.status(500).json({ message: 'Server error while download archive' });
    }
};




module.exports = {
    getFilesBySection,
    uploadFile,
    deleteFile,
    renameFile,
    downloadFile,
    downloadArchiveFile
};
