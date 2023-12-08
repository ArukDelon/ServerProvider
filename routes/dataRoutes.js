const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authMiddleware');
const dataController = require("../controllers/dataController");

router.use(authenticate);

router.get('/check-token', authenticate, dataController.checkToken);
router.post('/updateUser', authenticate, dataController.updateUser);


module.exports = router;