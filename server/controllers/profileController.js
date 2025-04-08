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
                attributes: ['name', 'faculty', 'position', 'bio', 'date_of_birth', 'university', 'city', 'profile_image'],
            }, //profile_image это всего лишь путь. Клиент потом этот путь дополняет чтобы загрузить фото
        });


        //console.log("DOSTUCHALIS", user);

        if (!user) {
            return res.status(404).json({ message: 'пользователь не найден' });
        }

        const userData = user.toJSON();


        res.json({ //ответ
            name: userData.profile?.name,
            email: userData.email,
            role: userData.is_admin ? 'admin' : 'user',
            date_of_birth: userData.profile?.date_of_birth,
            university: userData.profile?.university,
            faculty: userData.profile?.faculty,
            position: userData.profile?.position,
            bio: userData.profile?.bio,
            city: userData.profile?.city,
            created_at: userData.created_at,
            profile_image: userData.profile?.profile_image ? `/${userData.profile.profile_image}` : null, // вдруг нет фото
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};


const updateUserProfile = async (req, res) => {
    const { name, date_of_birth, faculty, position, about } = req.body;
    const userId = req.user.userId;

    try {

    } catch (err) {

    }
};

const updateProfileImage = async (req, res) => {
    const userId = req.user.userId;
    const filePath = `uploads/user_${userId}/${req.file.filename}`;

    try {



    } catch (error) {


    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    updateProfileImage
};
