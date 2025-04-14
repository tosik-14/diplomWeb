const db = require('../db');  // Путь к вашему файлу с запросами к базе данных
const { User, UserProfile } = require('../sequelize/models');
const authenticateToken = require('../middleware/authenticateToken');

const getUserProfile = async (req, res) => { // получаем данные профиля
    try {
        const userId = req.user.userId;

        const user = await User.findOne({ // тут собираются данные из двух таблиц: users и user_profiles
            where: { id: userId },
            include: {
                model: UserProfile,
                as: 'profile',  // результат из двух таблиц будет так называться
                attributes: ['first_name', 'second_name', 'patronymic', 'faculty', 'position', 'bio', /*'date_of_birth',*/ 'university', 'city', 'profile_image'],
            }, //profile_image это всего лишь путь. Клиент потом этот путь дополняет чтобы загрузить фото
        });


        //console.log("DOSTUCHALIS", user);

        if (!user) {
            return res.status(404).json({ message: 'пользователь не найден' });
        }

        const userData = user.toJSON();


        res.json({ //ответ
            firstName: userData.profile?.first_name,
            secondName: userData.profile?.second_name,
            patronymic: userData.profile?.patronymic ? `${userData.profile.patronymic}` : null,
            email: userData.email,
            role: userData.isAdmin ? 'admin' : 'user',
            /*date_of_birth: userData.profile?.date_of_birth,*/
            university: userData.profile?.university,
            faculty: userData.profile?.faculty,
            position: userData.profile?.position,
            bio: userData.profile?.bio,
            city: userData.profile?.city,
            created_at: userData.createdAt,
            profile_image: userData.profile?.profile_image ? `/${userData.profile.profile_image}` : null, // вдруг нет фото
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};


const updateUserProfile = async (req, res) => {
    const { first_name, second_name, patronymic, faculty, position, bio, university, city} = req.body;
    const userId = req.user.userId; // айди юзера из authenticateToken
    //console.log("UPDATE USER PROFILE START");
    try {
        const profile = await UserProfile.findOne({ where: { userId } });

        if (profile) {
            profile.first_name = first_name || profile.first_name;
            profile.second_name = second_name || profile.second_name;
            profile.patronymic = patronymic || profile.patronymic;
            profile.faculty = faculty || profile.faculty;
            profile.position = position || profile.position;
            profile.bio = bio || profile.bio;
            profile.university = university || profile.university;
            profile.city = city || profile.city;

            await profile.save();
        }else {
            await UserProfile.create({
                userId: userId,
                first_name: first_name,
                second_name: second_name,
                patronymic: patronymic,
                faculty: faculty,
                position: position,
                bio: bio,
                university: university,
                city: city,
            });

        }

        res.status(200).json({ message: 'Профиль успешно обновлён.' });
    } catch (err) {
        console.error('Ошибка при обновлении профиля:', err);
        res.status(500).json({ message: 'Ошибка сервера при обновлении профиля.' });
    }
};

const updateProfileImage = async (req, res) => {
    const userId = req.user.userId;
    //console.log("UPDATE AVATAR  START");
    if (!req.file) {  //multer добавляет файл в req
        return res.status(400).json({ message: 'Файл не был загружен.' });
    }

    const filePath = `uploads/user_${userId}/${req.file.filename}`;

    try {
        const profile = await UserProfile.findOne({ where: { userId } });

        if (!profile) {
            return res.status(404).json({ message: 'Профиль не найден.' });
        }


        if (profile.profile_image) { // удаление старой аватарки, если есть что удалять конечно
            const oldImagePath = path.join(__dirname, '..', profile.profile_image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }


        profile.profile_image = filePath; // обновляю путь до аватарки в бд
        await profile.save();

        res.status(200).json({ message: 'Аватарка обновлена.', profile_image: filePath });
    } catch (error) {
        console.error('Ошибка при обновлении аватарки:', error);
        res.status(500).json({ message: 'Ошибка сервера при обновлении аватарки.' });
    }
};

const getAdminData = async (req, res) => {
    try {
        const currentUserId = req.user.userId;


        const currentUser = await User.findOne({ // запрашиваем минимальные данные админа
            where: { id: currentUserId },
            include: {
                model: UserProfile,
                as: 'profile',
                attributes: ['first_name', 'second_name', 'patronymic'],
            },
        });

        if (!currentUser) {
            return res.status(404).json({ message: 'Текущий пользователь не найден' });
        }

        const currentUserData = {
            firstName: currentUser.profile?.first_name,
            secondName: currentUser.profile?.second_name,
            patronymic: currentUser.profile?.patronymic,
            email: currentUser.email,
            isAdmin: currentUser.isAdmin,
        };


        const users = await User.findAll({ // запрашиваем данные всех пользователей
            include: {
                model: UserProfile,
                as: 'profile',
                attributes: ['first_name', 'second_name', 'patronymic', 'faculty', 'position', 'university', 'city'],
            },
            attributes: ['id', 'email', 'isAdmin', 'createdAt'],
            order: [['createdAt', 'DESC']],
        });

        const usersData = users.map(user => ({
            id: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
            createdAt: user.createdAt,
            firstName: user.profile?.first_name,
            secondName: user.profile?.second_name,
            patronymic: user.profile?.patronymic,
            faculty: user.profile?.faculty,
            position: user.profile?.position,
            university: user.profile?.university,
            city: user.profile?.city,
        }));

        return res.json({
            currentUser: currentUserData, //данные админа
            users: usersData, // данные всех пользователей
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Ошибка сервера при получении данных администратора' });
    }
};

const updateUserRoles = async (req, res) => {
    const { userIds, isAdmin: isAdminNew } = req.body;

    if (!Array.isArray(userIds) || typeof isAdminNew !== 'boolean') {
        return res.status(400).json({ message: 'Неверный формат данных' });
    }

    try {
        const updated = await User.update(  //меняем значение
            { isAdmin: isAdminNew },
            { where: { id: userIds } }
        );

        res.status(200).json({ message: 'Роли пользователей обновлены', affectedRows: updated[0] });
    } catch (err) {
        console.error('Ошибка при обновлении ролей:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};


module.exports = {
    getUserProfile,
    updateUserProfile,
    updateProfileImage,
    getAdminData,
    updateUserRoles
};
