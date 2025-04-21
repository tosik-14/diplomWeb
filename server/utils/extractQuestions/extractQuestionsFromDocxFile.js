const fs = require('fs');
const unzipper = require('unzipper');
const { parseStringPromise } = require('xml2js');
const path = require('path');

const extractQuestionsWithImagesFromDocx = async (filePath, userId) => {
    const originalDocxName = path.basename(filePath, '.docx'); // достаем имя файла без .docx
    //console.log("FILENAME", originalDocxName);
    const tempDir = path.resolve(__dirname, '..', '..', `uploads/user_${userId}/temp_${userId}`, originalDocxName); // путь к архиву
    //console.log("TEMP DIR", tempDir); // 2 раза '..' т.к. от корня этот файл находится в utils/extractQuestions. => нужно сделать 2 шага назад

    if (!fs.existsSync(tempDir)) { //если такого архива не еще существует
        await unzipper.Open.file(filePath).then((zip) =>
            zip.extract({ path: tempDir }) // сохраняем его в папку по пути архива
        );                      //и не важно откуда этот файл, из бд или с компа. Его архив сохранится в папку временных файлов
    }

    //создаём объект, где ключи - это пути файлов в архиве, а значения - соответствующие entry-объекты
    //это удобно, чтобы потом быстро находить нужные файлы по пути, например: document.xml, rels, картинки и всё остально
    const zip = await unzipper.Open.file(filePath);
    const entries = {};
    for (const entry of zip.files) {
        entries[entry.path] = entry;
    }

    const documentXml = await entries['word/document.xml'].buffer().then(b => b.toString());// загружаем xml-содержимое всего документа: текст, абзацы, структура, вообще всё
    const relsXml = await entries['word/_rels/document.xml.rels'].buffer().then(b => b.toString()); // загружаем xml-файл связей (document.xml.rels),
                                                                                                    // который содержит сопоставления rId -> путь к любым ресурсам, например, к картинкам


    //1 парсим relsXml и строим карту соответствий rId -> путь к изображению
    const rels = await parseStringPromise(relsXml);// переделываем xml - relsXml в обычный js-объект для работы с ним
    const relationships = rels.Relationships.Relationship || [];// достаем массив всех Relationship, каждая из которых описывает связь
                                                                // например: rId5 -> media/image1.jpg. rId5 - это пример такой ссылки. По сути это ссылка на картинку

    const rIdToImage = {};// rIdToImage - это объект, в который щас сохраним: ключ - rId(это пример, так они выглядят) и значение - путь к картинке в архиве

    for (const rel of relationships) {

        const id = rel.$.Id;//записываем ключ(ссылку)

        const target = rel.$.Target;// записываем значение, например - media/image1.jpg

        if (target.startsWith('media/')) {//проверка, что target указывает на папку media т.е. это картинка, а не стиль или какая-нибудь еще шляпа

            rIdToImage[id] = 'word/' + target; // сохраняем полный путь к картинке: rId5 -> word/media/image1.jpg
        }
    }
    // примерно как выглядит rIdToImage
    /*{
        rId5: 'word/media/image1.jpg',
        rId6: 'word/media/image2.png',
        и тд
    }*/

    //2 парсим document.xml
    const parsedDoc = await parseStringPromise(documentXml);// переделываем xml-документ - document.xml в обычный js-объект для работы с ним
    const paragraphs = parsedDoc['w:document']['w:body'][0]['w:p']; //достаем массив абзацев документа (каждый абзац может быть текстом вопроса или изображение)

    const questions = [];//сюда будут записываться все вопросы и, если есть, то изображения
    let lastQuestionIndex = null;// индекс последнего вопроса, чтобы прикрепить к нему картинку, если она идёт отдельным абзацем

    for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];

        const pProps = p['w:pPr']?.[0]; // записываем настройки абзаца, например: отступы, нумерацию и тд
        const isListItem = !!(pProps && pProps['w:numPr']); // |||||||||||||||||||| КЛЮЧЕВОЕ |||||||||||| проверяем
                                                            // является абзац элементом нумерованного списка или нет. ТАК ОТЛИЧАЕМ ВОПРОСЫ ОТ ОСТАЛЬНОГО ТЕКСТА

        const runs = p['w:r'] || []; // записываем все элементы текста, изображение и всё, что касается вопроса

        let text = ''; //будущий текст
        let imageId = null; // будущее изображение

        for (const r of runs) {
            // достаем текст из вопроса из w:t
            if (r['w:t']) { // если w:t массив, забираем всё что есть.
                text += (Array.isArray(r['w:t']) ? r['w:t'].map(t => (typeof t === 'string' ? t : t._ || '')).join('') : '');
            }

            // достаем rId изображения, если оно есть
            const blip = r['w:drawing']?.[0]['wp:inline']?.[0]['a:graphic']?.[0]['a:graphicData']?.[0]['pic:pic']?.[0]['pic:blipFill']?.[0]['a:blip']?.[0];

            if (blip && blip['$'] && blip['$']['r:embed']) {// если оно есть, сохраняем rId, например: "rId5"
                imageId = blip['$']['r:embed'];
            }
        }

        if (isListItem && text.trim()) { // если это нумерованный абзац, т.е. вопрос, добавляем его в список
            //console.log("FILENAME", originalDocxName);

            questions.push({
                question: text.trim(),
                //image: imageId ? rIdToImage[imageId] || null : null
                image: imageId && rIdToImage[imageId] ? `${originalDocxName}/${rIdToImage[imageId]}` : null // сохраняем путь от корня архива до картинки
            });

            lastQuestionIndex = questions.length - 1; // обновляем индекс последнего вопроса, чтобы потом прикрепить к нему изображение, если оно в отдельном абзаце

        } else if (!isListItem && lastQuestionIndex !== null && imageId) { // между прочим почти всегда именно этот случай.
            // если это не нумерованный абзац, но в нём есть картинка, то прикрепляем её к последнему вопросу
            // на случай, если картинка уехала куда-то, или если оформление такое
            questions[lastQuestionIndex].image = `${originalDocxName}/${rIdToImage[imageId]}` || null;
        }
    }

    return questions;
}

module.exports = extractQuestionsWithImagesFromDocx;