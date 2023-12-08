const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const { MongoClient } = require('mongodb');
const authenticate = require('./middleware/authMiddleware');
const db = require('./db');
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');
const bodyParser = require("body-parser");
const { initializeApp, cert } = require('firebase-admin/app');
const admin = require('firebase-admin');
const serviceAccount = require('./providercrm-29c64-firebase-adminsdk-q9v33-bafccae22c.json');
const multer = require('multer');
const { v4 } = require("uuid");

admin.initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'providercrm-29c64.appspot.com',
});

const bucket = admin.storage().bucket();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.post('/profile', upload.single('avatar'), async function (req, res, next) {
    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded!' });
        }

        // Generate a unique filename using UUID
        const filename = `${v4()}_${req.file.originalname}`;

        // Upload the file to Firebase Storage
        const file = bucket.file(filename);
        await file.save(req.file.buffer);

        const downloadURL = file.publicUrl();

        res.status(200).json({ message: 'File uploaded successfully!', downloadURL });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

db.connectToDatabase();

app.use('/auth', authRoutes);
app.use('/data', dataRoutes);

const server = app.listen(port, () => console.log(`Server is running on port ${port}`));
