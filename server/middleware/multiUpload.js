const multer = require('multer');
const path = require('path');
const fs = require('fs');
const iconv = require('iconv-lite');

 //указываем что это милдвер и его тип RequestHandler

const storage = multer.diskStorage({ //настройка хранилища
    destination: (req, file, cb) => {

        const userId = req.user.userId;
        const baseUploadPath = path.join(__dirname, '..', 'uploads', `user_${userId}`).replace(/\\/g, '/'); //путь папки пользователя

        if (!fs.existsSync(baseUploadPath)) { // если нет папки пользователя - создаем
            fs.mkdirSync(baseUploadPath, { recursive: true });
        }

        const tempDir = path.join(baseUploadPath, `temp_${userId}`);//путь к верменной папке

        if (!fs.existsSync(tempDir)) { //если нет папки временных файлов - создаем
            fs.mkdirSync(tempDir, { recursive: true });
        }

        req.tempUploadPath = tempDir; // записываем путь в запрос чтобы потом юзать в контроллере

        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        let decodedName;
        //console.log("FILE multiUpload", file);
        try { // по большому счету декодировать имя в случае генерации билетов имеет еще меньше смысла, чем при простом сохранении
              // но в случае если что-то пойдет не так, в папке и в логах названия файлов хотя бы будут в нормальном виде
              // в любом случае файлы после генерации сразу удаляются. Но может этот мидлвер будет повторно где-то использоваться, хз
            decodedName = iconv.decode(Buffer.from(file.originalname, 'latin1'), 'utf8');
        } catch (err) {
            decodedName = file.originalname;
        }
        const uniqueName = Date.now() + '-' + decodedName;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage }); // делаем экземпляр multer с заданным хранилищем

const multiUpload = upload.fields( // мидлвер для приема файлов с 5 дропзон(5 типов вопросов), в которых до 5 файлов
    Array.from({ length: 5 }, (_, i) => ({ name: `filesGroup${i}`, maxCount: 5 }))
);

module.exports = /** @type {import('express').RequestHandler} */ (multiUpload); //экспорт как милдвер для Express
/* //в итоге запросе получается такая структура:
{
    filesGroup0: [file1, file2],
    filesGroup1: [file3],
    //и так далее до 5(максимум 5)
}
*/
