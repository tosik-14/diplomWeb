const { File } = require('../sequelize/models');
const fs = require('fs');
//const fs = require('fs').promises;
const path = require('path');
//const mammoth = require('mammoth');

const validateDocxFile = require('../utils/validateFile/validateDocxFile');


const validateFile = async (req, res) => {
    try {
        const file = req.file; //лутаем файлик
        if (!file) {
            return res.status(400).json({ message: 'Файл не передан' });
        }

        const validationResult = await validateDocxFile(file.path, true); //тест на валидность, удаляем при неудаче

        if (!validationResult.valid) {
            return res.status(400).json({ message: validationResult.error });
        }

        res.json({ message: 'Файл прошёл валидацию' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка сервера при валидации файла' });
    }
};



const validateFileFromStorage = async (req, res) => {
    try {
        const { id } = req.body; //достаем айди файла
        const file = await File.findByPk(id); //ищем файл в бд
        //console.log("FILE", file);

        if (!file) {
            //console.log("!FILE");
            return res.status(404).json({ message: 'Файл не найден' });
        }

        const filePath = file.filePath; //путь из бд
        const fullFilePath = path.resolve(__dirname, '..', filePath);  //полный путь из компьютера + бд
        //console.log("FILE USER ID AND FILENAME", file.userId, file.fileName);
        if (!fs.existsSync(fullFilePath)) {
            return res.status(404).json({ message: 'Файл не найден на диске' });
        }

        const validationResult = await validateDocxFile(fullFilePath, false); //тест на валидность, НЕ удаляем при неудаче, т.к. это файл с хранилища

        if (!validationResult.valid) {
            return res.status(400).json({ message: validationResult.error });
        }

        res.json({ message: 'Файл прошёл валидацию' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера при валидации файла' });
    }
};

//|||||||||||||||||||||||||||||||||||||||||||||||| СОЗДАЕНИЕ БИЛЕТОВ//////////////////////////////////////


const extractQuestionsWithImagesFromDocx = require('../utils/extractQuestions/extractQuestionsFromDocxFile');
const generateTickets = require('../utils/ticketCreator');

const createTickets = async (req, res) => {
    const errors = []; // массив для возможных ошибок
    //console.log('FILES', req.files);
    //console.log('FILES', req);
    try {
        const userId = req.user.userId;
        const { questionsPerType, ...otherFields } = req.body;
        const questionCounts = JSON.parse(questionsPerType);
        const fileGroupCount = parseInt(req.body.fileGroupCount); // определяем количество типов вопросов по длине массива с количествами вопросов каждого типа
        //console.log("FILE GROUP COUNT", fileGroupCount);
        //console.log("DB FILES GROUPS", req.body[`dbFilesGroup0`]);

        const groupedQuestions = [];

        for (let i = 0; i < fileGroupCount; i++) {
            const files = [];

            // --- 1. Проверка загруженных файлов (из drop-зоны)
            const uploaded = req.files?.[`filesGroup${i}`];
            if (uploaded && uploaded.length > 0) {
                uploaded.forEach(f => files.push(f.path));
            }


            const dbFileRaw = req.body[`dbFilesGroup${i}`]; // ЕСЛИ ПРИШЛИ ФАЙЛЫ, КОТОРЫЕ УЖЕ БЫЛИ НА ДИСКЕ
            if (dbFileRaw) {
                const dbFilesArray = Array.isArray(dbFileRaw) ? dbFileRaw : [dbFileRaw]; //определяем это массив файлов или только 1 файл

                for (const fileStr of dbFilesArray) {
                    let fileInfo; //здесь будет инфа о файле от клиента(клиент высылает id и name файла)
                    try {
                        fileInfo = JSON.parse(fileStr);// достаем инфу из json
                    } catch (err) {
                        console.error("Ошибка парсинга файла из хранилища:", fileStr, err.message);
                        return res.status(400).json({ message: 'Некорректный формат файла из хранилища' });
                    }

                    const file = await File.findByPk(fileInfo.id);//ищем файл по id в бд
                    //console.log("FILE", file);
                    if (!file) {
                        return res.status(404).json({ message: 'Файл не найден в базе данных' });
                    }

                    const fullFilePath = path.resolve(__dirname, '..', file.filePath); //полный путь из компьютера + бд
                    if (fs.existsSync(fullFilePath)) {
                        files.push(fullFilePath);
                    } else {
                        console.warn("Файл не найден на диске:", fullFilePath);
                        return res.status(404).json({ message: 'Файл не найден на диске' });
                    }
                }


            }


            const allQuestions = [];//массив будущих вопросов одной группы

            for (const filePath of files) {
                try {
                    const questions = await extractQuestionsWithImagesFromDocx(filePath, userId); //функция извлечения вопросов из файла
                    allQuestions.push(...questions);
                } catch (err) {
                    console.error(`Ошибка при извлечении вопросов из файла ${filePath}:`, err.message);
                    errors.push({ file: filePath, error: err.message });
                }
            }

            groupedQuestions.push(allQuestions); //все группы с вопросами
        }

        //console.log('Grouped Questions:', groupedQuestions);
        //console.log('OTHER FIELDS:', otherFields);

        try {
            // непосредственно генератор билетов. ФУНКЦИЯ РАДИ КОТОРОЙ ВСЕ СОБРАЛИСЬ ///////////////////////////////////////////////////////////////
            await generateTickets({
                groupedQuestions,
                questionsPerType: questionCounts,
                ...otherFields,
                userId,
            });
        } catch (err) {
            console.error('Ошибка/и во время генерации билетов', err.message);
            errors.push(err.message);
        }


        if (errors.length > 0) {  //если были какие-то ошибки, они возвращаются клиенту со статусом 207(типа выполнено, но с ошибками)
            return res.status(207).json({
                message: 'Возникли некоторые ошибки.',
                errors: errors,
            });
        }

        res.status(200).json({ message: 'Билеты успешно созданы' });

    } catch (error) {

        console.error('Ошибка при создании билетов:', error.message);
        res.status(500).json({ message: 'Ошибка при создании билетов' });

    } finally {
        ///////////////////ОЧЕНЬ ВАЖНО!!!!!!!!!!!!!!//////////// удаление временного содержимого папки temp, чтобы не забивать пространство мусором
        try {
            if (req.tempUploadPath && fs.existsSync(req.tempUploadPath)) { //проврерка что всё это дело вообще существует
                const files = await fs.promises.readdir(req.tempUploadPath); //берем имена всех файлов и папок внутри req.tempUploadPath
                await Promise.all(files.map(file => //дожидаемся одновременного выполнения всех промисов, короче все удаляется одновременно
                    fs.promises.rm(path.join(req.tempUploadPath, file), { recursive: true, force: true })//удаляем все единовременно выстраивая полный путь до элемента
                                                                        //recursive: true - если это папка, удаляем всё внутри нее, force: true если элемента не существует, ошибка не вылазит
                ));
            }
        } catch (err) {
            console.error("ОШИБКА УДАЛЕНИЯ ПАПКИ, БЕДА: ", err);
            res.status(500).json({ message: "Тревога! Временная папка не удалена с сервера!!!" })
        }

    }
};





module.exports = {
    validateFile,
    validateFileFromStorage,
    createTickets
};