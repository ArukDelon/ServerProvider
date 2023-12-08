const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Немає токена, авторизація відмовлена' });
    }
    try {
        const decodedToken = jwt.verify(token, config.jwtSecret);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Недійсний токен, авторизація відмовлена' });
    }
};

module.exports = authenticate;