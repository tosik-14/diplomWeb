const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");

const validateDocxFile = async (filePath, shouldDeleteOnFail = false) => {
    const deleteIfNeeded = () => {  // файл всегда удаляется. Он загрузился - проверился - удалился.
        if (shouldDeleteOnFail && fs.existsSync(filePath)) { // но только в случае, если его уже не было на диске
            fs.unlinkSync(filePath);
        }
    };

    try {
        if (path.extname(filePath).toLowerCase() !== '.docx') {
            deleteIfNeeded(); //удаляем
            return { valid: false, error: 'Допустимы только .docx файлы' };
        }

        const result = await mammoth.convertToHtml({ path: filePath });
        const html = result.value;
        //console.log("HTML:\n", html); // :))
        const liRegex = /<li>(.*?)<\/li>/gi;  //вообще это надо бы еще потестить, но нумерованные списки ворда распознаются mammoth как <li>, это элемент списка html
        const matches = [...html.matchAll(liRegex)].map(match => match[1].trim());//mammoth наверное самая простоя библиотка для работы с вордом
                                                                        //тут я ищу совпадения по liRegex, и если есть, то файл подходит

        if (matches.length === 0) {
            deleteIfNeeded(); // удаляем
            return { valid: false, error: 'Файл не содержит корректных вопросов' };
        }


        deleteIfNeeded();  // удаляем

        return { valid: true };
    } catch (err) {
        console.error('Ошибка при валидации .docx файла:', err);
        deleteIfNeeded();
        return { valid: false, error: 'Ошибка при анализе файла' };
    }
};

module.exports = validateDocxFile;