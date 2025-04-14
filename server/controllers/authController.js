const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../db');
const { User, UserProfile, Section } = require('../sequelize/models');


const registerUser = async (req, res) => { //регистрация
    const { email, password } = req.body;

    try {
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: hashedPassword,
        });

        await Section.bulkCreate([  // если пользователь зарегался, нужно сделать ему корневые папки.
            {
                name: 'Themes',
                parent_id: null,
                user_id: newUser.id,
            },
            {
                name: 'Tickets',
                parent_id: null,
                user_id: newUser.id,
            },
        ]);

        res.status(201).json({
            id: newUser.id,
            email: newUser.email,
            is_admin: newUser.isAdmin,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};


const loginUser = async (req, res) => { //авторизация
    const { email, password } = req.body;

    //console.log("TELO: ", req.body);

    try {

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        const userData = await User.findOne({
            where: { email },
            include: {
                model: UserProfile,
                as: 'profile', // ассоциация
                attributes: ['first_name', 'second_name', 'faculty', 'position', 'university', 'city'], //поля, которые обязательно должны быть заполнены
                //если они не заполнены, клиент направит юзера их заполнять
            },
        });

        //console.log("USER DATA: ", userData);

        const token = jwt.sign(
            { userId: user.id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            userProfile: userData.profile, // возвращаем данные из профиля
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};




module.exports = { registerUser, loginUser };
