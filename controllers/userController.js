const db = require('../db');
const jwt = require('jsonwebtoken');
const config = require('../config/config');


exports.createUser = async (req, res) => {
    try {
        console.log(req.body);
        const { username, password, firstname, lastname, number, role } = req.body;
        await db.createUser(username, password, firstname, lastname, number, role);

        res.status(201).json({ message: 'Користувач зареєстрований успішно' });
    } catch (error) {
        console.error('Помилка реєстрації користувача:', error);
        res.status(500).json({ message: 'Помилка сервера при реєстрації користувача' });
    }
};

exports.authenticateUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await db.authenticateUser(username, password);

        if (user) {
            const token = jwt.sign({ username: user.username, role: user.role }, config.jwtSecret, { expiresIn: '1h' });
            const userData = {
                token,
                userId: user._id,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                number: user.number,
                role: user.role
                // Додайте інші поля користувача, які вам потрібні
            };
            res.json(userData);
        } else {
            res.status(401).json({ message: 'Невірні дані аутентифікації' });
        }
    } catch (error) {
        console.error('Помилка аутентифікації користувача:', error);
        res.status(500).json({ message: 'Помилка сервера при аутентифікації користувача' });
    }
};

exports.checkToken = async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (error) {
        console.error('Помилка перевірки токена:', error);
        res.status(500).json({ message: 'Помилка сервера при перевірці токена' });
    }
};