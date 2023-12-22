const db = require('../db');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const {GridFSBucket, ObjectId} = require("mongodb");
const {v4} = require("uuid");



exports.checkToken = async (req, res) => {
    try {
        const username = req.user.username; // Отримуємо ім'я користувача з токена
        const user = await db.getUserByUsername(username);
        res.json({ user });
        console.log("check token")
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

exports.getUsers = async (req, res) => {
    try {
        const { } = req.query;

        // Викликаємо функцію з бази даних
        const clients = await db.getUsers();

        // Повертаємо відповідь клієнту з отриманими даними
        res.status(200).json({ clients });
        console.log(clients);
    } catch (error) {
        console.error('Error handling /services route:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getLogs = async (req, res) => {
    try {
        // Викликаємо функцію з бази даних, яка отримує всі логи (вам може знадобитися коректне ім'я функції для отримання логів)
        const allLogs = await db.getLogs();

        res.status(200).json({ logs: allLogs });
    } catch (error) {
        console.error('Error handling /logs route:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


exports.deleteUsers = async (req, res) => {
    try {
        const clientsIds = req.body.clientsIds; // Отримуємо ідентифікатори сервісів з тіла запиту

        // Перевіряємо, чи існують сервіси з вказаними ідентифікаторами
        const existingUsers = await db.getUsersByIds(clientsIds);
        if (!existingUsers || existingUsers.length === 0) {
            res.status(404).json({ message: 'Клієнтів не знайдено' });
            return;
        }

        // Викликаємо функцію видалення сервісів за ідентифікаторами
        await db.deleteUsersByIds(clientsIds);

        res.status(200).json({ message: 'Сервіси успішно видалено' });
    } catch (error) {
        console.error('Помилка видалення сервісів:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.uploadProfile = async function (req, res, next) {
    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded!' });
        }

        // Generate a unique filename using UUID
        const filename = `${v4()}_${req.file.originalname}`;

        // Upload the file to Firebase Storage
        const file = db.bucket.file(filename);
        await file.save(req.file.buffer);

        const downloadURL = file.publicUrl();

        res.status(200).json({ message: 'File uploaded successfully!', downloadURL });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.changePassword = async (req, res) => {
    try {
        const username = req.user.username; // Отримуємо ім'я користувача з токена
        const newPassword = req.body.password; // Отримуємо дані для оновлення з тіла запиту

        // Оновлюємо дані користувача
        await db.changePassword(username, newPassword);

        res.json({});
    } catch (error) {
        console.error('Помилка оновлення інформації користувача:', error);
        res.status(500).json({ message: 'Помилка сервера при оновленні інформації користувача' });
    }
};



exports.createService = async (req, res) => {
    try {
        const newServiceData = req.body; // Отримуємо дані нового сервісу з тіла запиту

        // Додавання нового сервісу до бази даних
        const createdService = await db.createService(newServiceData);

    } catch (error) {
        if(error.message === 'Service exists')
        {
            res.status(400).json({ message: 'Сервіс з такою назвою вже існує' });
            return;
        }
        console.error('Помилка створення нового сервісу:', error);
        res.status(500).json({ message: 'Помилка сервера при створенні нового сервісу' });
    }
};

exports.updateService = async (req, res) => {
    try {
        const serviceId = req.params.id;
        const updatedServiceData = req.body; // Отримуємо оновлені дані сервісу з тіла запиту

        const existingService = await db.getServiceById(serviceId);
        if (!existingService) {
            res.status(404).json({ message: 'Сервіс не знайдено' });
            return;
        }

        await db.updateServiceById(serviceId, updatedServiceData);

        res.status(200).json({ message: 'Сервіс успішно оновлено' });
    } catch (error) {
        console.error('Помилка оновлення сервісу:', error);
        res.status(500).json({ message: 'Помилка сервера при оновленні сервісу' });
    }
};

exports.deleteServices = async (req, res) => {
    try {
        const serviceIds = req.body.serviceIds; // Отримуємо ідентифікатори сервісів з тіла запиту

        // Перевіряємо, чи існують сервіси з вказаними ідентифікаторами
        const existingServices = await db.getServicesByIds(serviceIds);
        if (!existingServices || existingServices.length === 0) {
            res.status(404).json({ message: 'Сервіси не знайдено' });
            return;
        }

        // Викликаємо функцію видалення сервісів за ідентифікаторами
        await db.deleteServicesByIds(serviceIds);

        res.status(200).json({ message: 'Сервіси успішно видалено' });
    } catch (error) {
        console.error('Помилка видалення сервісів:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.createBill = async (req, res) => {
    try {
        const newBillData = req.body; // Отримуємо дані нового рахунку з тіла запиту

        // Додавання нового рахунку до бази даних
        const createdBill = await db.createBill(newBillData);

        res.status(201).json({ message: 'Рахунок успішно створено', bill: createdBill });
    } catch (error) {
        console.error('Помилка створення нового рахунку:', error);
        res.status(500).json({ message: 'Помилка сервера при створенні нового рахунку' });
    }
};

exports.updateBill = async (req, res) => {
    try {
        const billId = req.params.id;
        const updatedBillData = req.body; // Отримуємо оновлені дані рахунку з тіла запиту

        const existingBill = await db.getBillById(billId);
        if (!existingBill) {
            res.status(404).json({ message: 'Рахунок не знайдено' });
            return;
        }

        await db.updateBillById(billId, updatedBillData);

        res.status(200).json({ message: 'Рахунок успішно оновлено' });
    } catch (error) {
        console.error('Помилка оновлення рахунку:', error);
        res.status(500).json({ message: 'Помилка сервера при оновленні рахунку' });
    }
};

exports.deleteBills = async (req, res) => {
    try {
        const billIds = req.body.billIds; // Отримуємо ідентифікатори рахунків з тіла запиту

        // Перевіряємо, чи існують рахунки з вказаними ідентифікаторами
        const existingBills = await db.getBillsByIds(billIds);
        if (!existingBills || existingBills.length === 0) {
            res.status(404).json({ message: 'Рахунки не знайдено' });
            return;
        }

        // Викликаємо функцію видалення рахунків за ідентифікаторами
        await db.deleteBillsByIds(billIds);

        res.status(200).json({ message: 'Рахунки успішно видалено' });
    } catch (error) {
        console.error('Помилка видалення рахунків:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getBills = async (req, res) => {
    try {
        // Отримуємо параметри запиту
        const {} = req.query;

        // Викликаємо функцію з бази даних для отримання рахунків
        const bills = await db.getBills();

        // Повертаємо відповідь клієнту з отриманими даними
        res.status(200).json({ bills });
    } catch (error) {
        console.error('Error handling /bills route:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getBillById = async (req, res) => {
    try {
        const billId = req.params.id; // Отримуємо ідентифікатор рахунку з параметра маршруту

        // Отримуємо дані рахунку з бази даних за ідентифікатором
        const bill = await db.getBillById(billId);

        if (!bill) {
            res.status(404).json({ message: 'Рахунок не знайдено' });
            return;
        }

        res.status(200).json({ bill });
    } catch (error) {
        console.error('Помилка отримання даних рахунку:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getBillByUserId = async (req, res) => {
    try {
        const userId = req.params.userId; // Отримуємо ідентифікатор рахунку з параметра маршруту

        // Отримуємо дані рахунку з бази даних за ідентифікатором
        const bills = await db.getBillsByUserId(userId);

        if (!bills) {
            res.status(404).json({ message: 'Рахунок не знайдено' });
            return;
        }

        res.status(200).json({ bills });
    } catch (error) {
        console.error('Помилка отримання даних рахунку:', error);
        res.status(500).json({ message: error.message });
    }
};



exports.getServices = async (req, res) => {
    try {
        const { serviceType, status, searchQuery } = req.query;

        // Викликаємо функцію з бази даних
        const services = await db.getServices(serviceType, status, searchQuery);

        // Повертаємо відповідь клієнту з отриманими даними
        res.status(200).json({ services });
    } catch (error) {
        console.error('Error handling /services route:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getServiceById = async (req, res) => {
    try {
        const serviceId = req.params.id; // Отримуємо ідентифікатор сервісу з параметра маршруту

        // Отримуємо дані сервісу з бази даних за ідентифікатором
        const service = await db.getServiceById(serviceId);

        if (!service) {
            res.status(404).json({ message: 'Сервіс не знайдено' });
            return;
        }

        res.status(200).json({ service });
    } catch (error) {
        console.error('Помилка отримання даних сервісу:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        // Викликаємо функцію з бази даних для отримання оплат
        const payments = await db.getPayments();

        // Повертаємо відповідь клієнту з отриманими даними
        res.status(200).json({ payments });
    } catch (error) {
        console.error('Error handling /payments route:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getPaymentsByBillId = async (req, res) => {
    try {
        const billId = req.params.billId; // Отримуємо ідентифікатор рахунку з параметра маршруту

        // Отримуємо дані рахунку з бази даних за ідентифікатором
        const payments = await db.getPaymentsByBillId(billId);

        if (!payments) {
            res.status(404).json({ message: 'Рахунок не знайдено' });
            return;
        }

        res.status(200).json({ payments });
    } catch (error) {
        console.error('Помилка отримання даних рахунку:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.createPayment = async (req, res) => {
    try {
        const paymentData = req.body; // Отримуємо дані нового рахунку з тіла запиту

        // Додавання нового рахунку до бази даних
        const createdPayment = await db.createPayment(paymentData);

        res.status(201).json({ message: 'Рахунок успішно створено'});
    } catch (error) {
        console.error('Помилка створення нового рахунку:', error);
        res.status(500).json({ message: 'Помилка сервера при створенні нового рахунку' });
    }
};

