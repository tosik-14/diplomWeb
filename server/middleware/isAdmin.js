const { User } = require('../sequelize/models');

const isAdmin = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Доступ запрещен: Вы не админ' });
        }

        next();
    } catch (err) {
        console.error('Ошибка в isAdmin middleware:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

module.exports = isAdmin;