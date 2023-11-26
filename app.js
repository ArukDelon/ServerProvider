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


app.use(cors());
app.use(bodyParser.json());
app.use(express.json());



db.connectToDatabase();



app.use('/auth', authRoutes);
app.use('/check-token', dataRoutes);


const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));
