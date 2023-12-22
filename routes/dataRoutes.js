const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authMiddleware');
const dataController = require("../controllers/dataController");
const multer = require('multer');
const userController = require("../controllers/userController");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(authenticate);

router.get('/check-token', authenticate, dataController.checkToken);
router.post('/updateUser', authenticate, dataController.updateUser);
router.post('/changePassword', authenticate, dataController.changePassword);
router.post('/profile',authenticate, upload.single('avatar'), dataController.uploadProfile);

router.get('/services', authenticate, dataController.getServices);
router.get('/services/:id', authenticate, dataController.getServiceById);
router.post('/services/add', authenticate, dataController.createService);
router.put('/services/update/:id', authenticate, dataController.updateService);
router.delete('/services/delete', authenticate, dataController.deleteServices);

router.get('/clients', authenticate, dataController.getUsers);
router.post('/clients/add', authenticate, userController.createUser);
router.get('/clients/delete', authenticate, dataController.deleteUsers);

router.get('/bills', authenticate, dataController.getBills);
router.get('/bills/:id', authenticate, dataController.getBillById);
router.get('/bills/:userId', authenticate, dataController.getBillByUserId);
router.post('/bills/add', authenticate, dataController.createBill);
router.post('/bills/update/:id', authenticate, dataController.updateBill);
router.delete('/bills/delete', authenticate, dataController.createBill);

router.get('/payments', authenticate, dataController.getPayments);
router.get('/payments/:billId', authenticate, dataController.getPayments);
router.post('/payments/add', authenticate, dataController.createPayment);

router.get('/logs', authenticate, dataController.getLogs);

module.exports = router;