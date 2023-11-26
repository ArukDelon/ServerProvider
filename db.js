const { MongoClient, ServerApiVersion} = require('mongodb');
const uri = "mongodb+srv://ArukAdmin:s6AmyxKy4QHzhCKm@arukcluster.v7i9lzc.mongodb.net/?retryWrites=true&w=majority";
const bcrypt = require('bcrypt');

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    tls: false
});

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to the database');
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}
async function closeDatabaseConnection() {
    try {
        await client.close();
        console.log('Connection to the database closed');
    } catch (error) {
        console.error('Error closing the database connection:', error);
    }
}

async function createUser(username, password, firstname, lastname, number, role) {
    try {
        const collection = client.db("CRMProvider").collection("users");
        const hashedPassword = await bcrypt.hash(password, 10); // "10" - кількість раундів для хешування

        const result = await collection.insertOne({
            username,
            password: hashedPassword,
            firstname,
            lastname,
            number,
            role: role || 'client',
        });
        console.log(`User ${username} created with ID: ${result.insertedId}`);
    } catch (error) {
        console.error('Error creating user:', error);
        throw error; // Пропагуємо помилку на рівень вище
    }
}

async function authenticateUser(username, password) {
    try {
        const collection = client.db("CRMProvider").collection("users");
        const user = await collection.findOne({ username });

        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                console.log(`User ${username} authenticated`);
                return user;
            } else {
                console.log(`Authentication failed for user ${username}: Invalid password`);
                return null;
            }
        } else {
            console.log(`Authentication failed for user ${username}: User not found`);
            return null;
        }
    } catch (error) {
        console.error('Error authenticating user:', error);
        throw error;
    }
}

module.exports = {
    connectToDatabase,
    createUser,
    authenticateUser,
    closeDatabaseConnection
};