const fs = require('fs');
const unzipper = require('unzipper');
const { parseStringPromise } = require('xml2js');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } = require('docx');
const { imageSize } = require('image-size'); // для определения размеров картинки, чтобы потом можно было уменьшить ее сохраняя пропорции


const generateTickets = async ({
    groupedQuestions,
    questionsPerType,
    ticketCount,
    fileName,
    university,
    faculty,
    discipline,
    department,
    headOfDepartment,
    userName,
    userPosition,
    ticketProtocol,
    season,
    sessionYears,
    approvalDate,
    userId
}) => {
    try {

        /*console.log('\nДАННЫЕ ДЛЯ ГЕНЕРАЦИИ БИЛЕТОВ:\n');


        console.log("ИМЯ ФАЙЛА: ", fileName);
        console.log("УНИВЕРСИТЕТ: ", university);
        console.log("ФАКУЛЬТЕТ: ", faculty);
        console.log("ДИСЦИПЛИНА: ", discipline);
        console.log("КАФЕДРА: ", department);
        console.log("ЗАВ КАФЕДРЫ: ", headOfDepartment);
        console.log("ПРЕПОДАВАТЕЛЬ: ", userName);
        console.log("ДОЛЖНОСТЬ: ", userPosition);
        console.log("ПРОТОКОЛ: ", ticketProtocol);
        console.log("СЕЗОН: ", season);
        console.log("ГОД СЕССИИ: ", sessionYears);
        console.log("ДАТА БИЛЕТА: ", approvalDate);
        console.log("АЙДИ ЮЗЕРА", userId);

        console.log('\nКОЛИЧЕСТВО БИЛЕТОВ');
        console.log(ticketCount);


        console.log('\nКОЛИЧЕСТВО ВОПРОСОВ ПО ТИПАМ');
        console.log(questionsPerType);*/


        //console.log('\nВОПРОСЫ:', groupedQuestions);

        await generateTicketsDOCX(
            {
                groupedQuestions,
                questionsPerType,
                ticketCount,
                fileName,
                university,
                faculty,
                discipline,
                department,
                headOfDepartment,
                userName,
                userPosition,
                ticketProtocol,
                season,
                sessionYears,
                approvalDate,
                userId
            }
        );






    } catch (err) {
        console.error('Ошибка в генерации:', err);
        throw new Error("Ошибка передачи информации генератору билетов формата .docx");

    }
};


const generateTicketsDOCX = async ({
                                       groupedQuestions, //долбаный IDE не дает норм отступы сделать
                                       questionsPerType,
                                       ticketCount,
                                       fileName,
                                       university,
                                       faculty,
                                       discipline,
                                       department,
                                       headOfDepartment,
                                       userName,
                                       userPosition,
                                       ticketProtocol,
                                       season,
                                       sessionYears,
                                       approvalDate,
                                       userId
                                   }) => {



    //const ticketNumber = 3;
    const groupedQuestionsOriginal = groupedQuestions.map(group => [...group]); // оригинал
    let groupedQuestionsCopy = groupedQuestionsOriginal.map(group => [...group]); // рабочая копия
    //const numberOfTickets = 3; // временное количество билетов
    const allTickets = []; // сюда будем пушить массив параграфов для каждого билета

    const seasonText = season === 'winter' ? 'Зимняя' : 'Летняя';

    for (let ticketIndex = 0; ticketIndex < ticketCount; ticketIndex++) { // цикл, создает заданное количество билетов
        try {
            if (groupedQuestionsCopy.some((group, i) => group.length < questionsPerType[i])) { // если вопросов в билетах слишком много, а из файлов мало
                                                                                               // то вопросы из файлов дублируются
                //console.log('DUBLICATE');

                groupedQuestionsCopy = groupedQuestionsOriginal.map((group, i) => {//если в копии групп вопросов не хватает вопросов, наполняем массив заново.
                                                                                   // причем наполняем копию из оригинала, чтобы не повредить его
                    const requiredCount = questionsPerType[i]; // запоминаем сколько вопросов конкретного типа нужно
                    const copiedGroup = [...group]; // берем группу вопросов

                    if (group.length === 0) { //если все же в оригинале была пустая группа, то это жесткая ошибка
                        console.log(`Внимание! вопросов в группе${i} нет, клиент или сервер некорректно собрали группу.`);
                        return copiedGroup;
                    }

                    while (copiedGroup.length < requiredCount) { // если во всей группе вопросов меньше, чем вопросов в одном типе для билета, то дублируем повторно
                        copiedGroup.push(...group);
                    }

                    return copiedGroup;
                });
            }
        }catch (err){
            throw new Error("Ошибка в дублировании групп вопросов");
        }




        const paragraphs = [
            new Paragraph({
                children: [new TextRun({text: university})],
                alignment: AlignmentType.CENTER,
                spacing: {
                    after: 200, // значение в twentieths of a point 200 = 10pt = 1 строка, пустое пространство под строкой короче говоря
                },
                keepLines: true, // просит ворд не разрывать абзац
                keepNext: true, // просит ворд держать этот абзац со следующим.
            }),
            new Paragraph({
                children: [new TextRun({text: faculty, bold: true})],
                alignment: AlignmentType.CENTER,
                spacing: {
                    after: 200, // значение в twentieths of a point 200 = 10pt = 1 строка, пустое пространство под строкой короче говоря
                },
                keepLines: true,
                keepNext: true,
            }),
            new Paragraph({
                children: [new TextRun({text: department})],
                alignment: AlignmentType.CENTER,
                spacing: {
                    after: 200, // значение в twentieths of a point 200 = 10pt = 1 строка, пустое пространство под строкой короче говоря
                },
                keepLines: true,
                keepNext: true,
            }),
            new Paragraph({
                children: [new TextRun({text: `ЭКЗАМЕНАЦИОНННЫЙ БИЛЕТ № ${ticketIndex+1}`})],
                alignment: AlignmentType.CENTER,
                spacing: {
                    after: 200, // значение в twentieths of a point 200 = 10pt = 1 строка, пустое пространство под строкой короче говоря
                },
                keepLines: true,
                keepNext: true,
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Дисциплина:    ' }),
                    new TextRun({
                        text: discipline,
                        underline: {}, // делаем текс подчеркнутым
                    }),
                ],
                alignment: AlignmentType.LEFT,
                keepLines: true,
                keepNext: true,
            }),
            new Paragraph({
                children: [
                    new TextRun({text: `${seasonText} экзаменационная сессия ${sessionYears} учебного года`}),
                ],
                alignment: AlignmentType.LEFT,
                spacing: {
                    after: 200, // значение в twentieths of a point 200 = 10pt = 1 строка, пустое пространство под строкой короче говоря
                },
                keepLines: true,
                keepNext: true,
            }),
        ];


        // Вопросы для билета №1
        /*const selectedQuestions = groupedQuestions.map((group) => {
            const randIndex = Math.floor(Math.random() * group.length);
            return group[randIndex];
            //return group[0]; // временно
        });*/

        let questionIndex = 1; // номер вопроса в билете

        questionsPerType.forEach((count, typeIndex) => { // цикл, проходящий по каждой группе вопросов. длина массива questionsPerType равна количеству таких групп
                        //count - это количество вопросов данного типа | typeIndex - номер группы(типа) вопросов
            //const questionsOfThisType = groupedQuestions[typeIndex]; // получаем вопросы нужного типа


            const group = groupedQuestionsCopy[typeIndex]; //записываем все вопросы одной определенной группы

            const shuffled = [...group].sort(() => Math.random() - 0.5); //перемешиваем вопросы этой группы
            const selected = shuffled.slice(0, count); // забираем нужное количество вопросов из типа(count это количество вопросов данного типа)


            groupedQuestionsCopy[typeIndex] = group.filter(q => !selected.includes(q)); //из общего массива групп с вопросами удаляем только что использованные, чтобы потом не повторялись


            selected.forEach((q) => { //наконец идем по массиву вопросов только этого типа только для этого билета
                paragraphs.push(
                    new Paragraph({
                        children: [new TextRun({text: `${questionIndex}. ${q.question}`})],
                        alignment: AlignmentType.LEFT,
                        keepLines: true,
                        keepNext: true,
                    })
                );
                //console.log("QUESTION IMAGE PATH", q.image);

                if (q.image) { // если есть картинка
                    const imagePath = path.resolve(__dirname, '..', `uploads/user_${userId}/temp_${userId}`, q.image);
                    const ext = path.extname(imagePath).slice(1);  // определяем формат картинки, например .jpeg
                    const imageFileName = q.image.split('/')[0]; // извлекаем только имя файла для отчета об ошибках

                    try {
                        if (!fs.existsSync(imagePath)) {
                            throw new Error(`Картинка не найдена: ${imageFileName}`);
                        }

                        const imageBuffer = fs.readFileSync(imagePath); //записываем саму картинку

                        if (!Buffer.isBuffer(imageBuffer)) {  //если картинка записалась некорректно
                            throw new Error(`Неверный формат картинки: ${imageFileName}`);
                        }

                        const dimensions = imageSize(imageBuffer);  // узнаем размер картинки чтобы изменить ее размер пропорционально
                        if (!dimensions?.width || !dimensions?.height) {
                            throw new Error(`Не удалось определить размеры картинки: ${imageFileName}`);
                        }

                        const desiredHeight = 150; //устанавлием свою кастомную высоту
                        const ratio = dimensions.width / dimensions.height;
                        const calculatedWidth = Math.round(desiredHeight * ratio); //вычисляем какой должна быть ширина для сохранения пропорций

                        paragraphs.push(
                            new Paragraph({
                                children: [
                                    new ImageRun({
                                        data: imageBuffer, // картинка
                                        transformation: { // размер
                                            width: calculatedWidth,
                                            height: desiredHeight,
                                        },
                                        extension: ext, // точно указываем ворду формат картинки
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                                keepLines: true,
                                keepNext: true,
                            })
                        );
                    } catch (err) {
                        console.error(`Ошибка при обработке картинки ${imageFileName}:`, err.message);
                        throw new Error(`Не удалось обработать картинку: ${imageFileName}`);
                    }
                }
                questionIndex++; //увеличиваем счетчик вопросов
            });

        });

        // Подписи
        paragraphs.push(new Paragraph({// отступ
            text: '',
            keepLines: true,
            keepNext: true,
        }));
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({text: `Зав. Кафедрой ________ ${headOfDepartment}`}),
                ],
                alignment: AlignmentType.LEFT,
                keepLines: true,
                keepNext: true,
            })
        );

        const bottomRow = `${userPosition} ________ ${userName}`;
        if (bottomRow.length < 60) {
            paragraphs.push(
                new Paragraph({
                    children: [new TextRun({text: bottomRow})],
                    alignment: AlignmentType.LEFT,
                    keepLines: true,
                    keepNext: true,
                })
            );
        } else {
            paragraphs.push(
                new Paragraph({
                    children: [new TextRun({text: userPosition})],
                    alignment: AlignmentType.LEFT,
                    keepLines: true,
                    keepNext: true,
                })
            );
            paragraphs.push(
                new Paragraph({
                    children: [new TextRun({text: `________ ${userName}`})],
                    alignment: AlignmentType.LEFT,
                    keepLines: true,
                    keepNext: true,
                })
            );
        }

        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Утверждено на заседании кафедры ${approvalDate}, Протокол №${ticketProtocol}`,
                    }),
                ],
                alignment: AlignmentType.LEFT,
                keepLines: true,
                keepNext: false, // это последний абзац билета, его не нужно держать со следующим
            })
        );

        allTickets.push(paragraphs); // сохряняем все билеты
    }

    const doc = new Document({      //создаем документ
        creator: "ExamTicketCreator",      //обязательные метаданные, без них не создается
        title: "Веб-приложение создано в рамках дипломной работы",
        description: "Дипломная работа студента группы 10701321 Михайловского Антона Владимировича, БНТУ, ФИТР, ПОИТ, 2025",
        styles: {
            default: {
                document: {
                    run: {
                        font: 'Times New Roman',
                        size: 28, // это 14 шрифт, ворд в ворде реальный размер это шрифт 14*2 => тут указываем 28
                    },
                },
            },
        },
        sections: [
            {
                properties: {  //  задаем отступы от границ страницы, шоб больше влезло
                    page: {
                        margin: {
                            top: 720,     // в TWIP (1/20 точки). 720 = 0.5 дюйма = 1.27 см
                            bottom: 720,
                            left: 720,
                            right: 720,
                        },
                    },
                },
                children: allTickets.flat(),
            },
        ],

    });
    //doc.addSection({ children: paragraphs });
    //const uniqueFileName = generateUniqueFileName(fileName);

    //const buffer = await Packer.toBuffer(doc);
    //const outputPath = path.resolve(__dirname, '..', 'uploads', `user_${userId}`, `${uniqueFileName}`); // __dirname, '..' путь до файла и выход из папки назад
                                                                                //иначе он думает, что в пути есть папка utils. Можно убрать __dirname, '..' и все будет работать так же
                                                                                //т.к. path.resolve берет тот путь от которого запускается проект. Но это не очень безопасно.
    //fs.writeFileSync(outputPath, buffer); // это надо будет заменить. Оно останавливает сервер, пока пользователь не загрузит файл

    //await saveTicketFileToDb({ userId, uniqueFileName, outputPath});


    try {
        const uniqueFileName = generateUniqueFileName(fileName); // создаем уникальное имя для файла
        const buffer = await Packer.toBuffer(doc);
        const outputPath = path.resolve(__dirname, '..', 'uploads', `user_${userId}`, uniqueFileName); // полный путь для сохранения

        await fs.promises.writeFile(outputPath, buffer);

        const dbFilePath = (`uploads/user_${userId}/${uniqueFileName}`); //  путь до файла из корня сервера для базы данных
        await saveTicketFileToDb({ userId, uniqueFileName, filePath: dbFilePath });
        //console.log('ФАЙЛ СОЗДАН', outputPath);
    } catch (error) {
        console.error('Ошибка при создании билета:', error.message);
        throw new Error("Ошибка при создании билета и записи его в базу данных");
    }
    //console.log('ФАЙЛ СОЗДАН', outputPath);

}

//////////////////////////////////////////// внизу сохранение файла в бд

const { File, Section } = require('../sequelize/models');

async function saveTicketFileToDb({ userId, uniqueFileName, filePath }) { //сохраение записи с о файле с билетами в бд
    const rootTicketsFolder = await Section.findOne({ // ищем корневую папку Tickets пользователя
        where: {
            name: 'Tickets',
            parentId: null,
            userId: userId,
        },
    });

    if (!rootTicketsFolder) {
        throw new Error('У пользователя нет корневой папки, ошибка сервера');
    }

    const newFile = await File.create({ // сохранение файла в бд
        fileName: uniqueFileName,
        filePath: filePath,
        sectionId: rootTicketsFolder.id,
        userId: userId,
    });

    return newFile;
}

function generateUniqueFileName(fileName) { // создание уникального имени в случае повторения.

    const timestamp = Date.now();

    const finalName = `${fileName}_${timestamp}.docx`;

    return finalName;
}

module.exports = generateTickets;