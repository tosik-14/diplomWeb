const multer = require('multer');
const path = require('path');
const fs = require('fs');
const iconv = require('iconv-lite'); // для корректной работы с разными языками.

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.user.userId;  // id юзера из токена
        const uploadPath = path.join(__dirname, '..', 'uploads', `user_${userId}`).replace(/\\/g, '/');



        if (!fs.existsSync(uploadPath)) {   // если папка не существует, создаем новую
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        /*const encodedName = iconv.encode(file.originalname, 'utf-8').toString('utf-8');
        console.log('ENCODED NAME:', encodedName);
        const uniqueName = Date.now() + '-' + encodedName;
        console.log('UNIQUE NAME: ', uniqueName);
        cb(null, uniqueName);*/
        // Попробуем перекодировать, если имя файла битое (в latin1)
        let decodedName;

        try {
            decodedName = iconv.decode(Buffer.from(file.originalname, 'latin1'), 'utf8'); //декодируем имена файлов
            //console.log('DECODED NAME:', decodedName);
        } catch (err) {
            //console.error('Ошибка при декодировании имени файла:', err.message);
            decodedName = file.originalname; // fallback
        }

        const uniqueName = Date.now() + '-' + decodedName; //добавляем уникальный номер каждому файлу

        //console.log('UNIQUE NAME: ', uniqueName);
        cb(null, uniqueName);

        file.decodedOriginalName = decodedName;
    },
});

const upload = multer({ storage });

module.exports = upload;