const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const { MongoClient, ServerApiVersion } = require('mongodb');
const authenticate = require('./middleware/authMiddleware');
const db = require('./db');
const cors = require("cors");
const authRoutes = require('./routes/users');
const dataRoutes = require('./routes/dataRoutes')
const bodyParser = require("body-parser");

const uri = "mongodb+srv://ArukAdmin:s6AmyxKy4QHzhCKm@arukcluster.v7i9lzc.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    tls: false
});
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());



db.connectToDatabase();

process.on('exit', async () => {
    console.log('Exiting application');
    await db.closeDatabaseConnection();
});




app.use('/auth', authRoutes);
app.use('/check-token', dataRoutes);


const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));
