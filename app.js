const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const authenticate = require('./middleware/authMiddleware');
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/data', dataRoutes);

const server = app.listen(port, () => console.log(`Server is running on port ${port}`));
