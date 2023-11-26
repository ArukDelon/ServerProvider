const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authMiddleware');
const userController = require("../controllers/userController");

router.use(authenticate);

// Загальний маршрут для отримання даних
router.get('/', (req, res) => {
    // Отримати дані з бази даних або іншого джерела
    // і відправити їх клієнту
    res.json({ message: 'Отримано дані' });
});

router.get('/check-token', authenticate, userController.checkToken);



module.exports = router;