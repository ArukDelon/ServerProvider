const db = require('../db');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const {GridFSBucket, ObjectId} = require("mongodb");



exports.checkToken = async (req, res) => {
    try {
        const username = req.user.username; // Отримуємо ім'я користувача з токена
        const user = await db.getUserByUsername(username);
        res.json({ user });
    } catch (error) {
        console.error('Помилка отримання інформації про користувача:', error);
        res.status(500).json({ message: 'Помилка сервера при отриманні інформації про користувача' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const username = req.user.username; // Отримуємо ім'я користувача з токена
        const updatedData = req.body; // Отримуємо дані для оновлення з тіла запиту

        // Оновлюємо дані користувача
        await db.updateUser(username, updatedData);

        res.json({ user:updatedData});
    } catch (error) {
        console.error('Помилка оновлення інформації користувача:', error);
        res.status(500).json({ message: 'Помилка сервера при оновленні інформації користувача' });
    }
};