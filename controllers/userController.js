const db = require('../db');
const jwt = require('jsonwebtoken');
const config = require('../config/config');


exports.createUser = async (req, res) => {
    try {
        console.log(req.body);
        const { username, password, firstname, lastname, number, role, email, address } = req.body;
        await db.createUser(username, password, firstname, lastname, number, role, email, address);

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
            const token = generateToken(user);
            const userData = {
                token,
                userId: user._id,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                number: user.number,
                role: user.role
            };
            res.json(userData);
        } else {
            res.status(401).json({ message: 'Неправильні дані аутентифікації' });
        }
    } catch (error) {
        if(error.message === 'Invalid password')
        {
            console.error('Помилка аутентифікації користувача:', error.message);
            res.status(401).json({ message: 'Неправильний пароль' });
            return;
        }
        if(error.message === 'User not found')
        {
            console.error('Помилка аутентифікації користувача:', error.message);
            res.status(404).json({ message: 'Користувача з таким ім\'ям не знайдено' });
            return;
        }
        res.status(500).json({ message: 'Помилка сервера при аутентифікації користувача' });
    }
};

const generateToken = (user) => {
    const tokenPayload = { username: user.username, role: user.role };
    const expiresIn = '24h'; // токен буде дійсний 24 годину
    const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn});
    return token;
};
