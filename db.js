const { MongoClient, ServerApiVersion} = require('mongodb');
const uri = "mongodb+srv://ArukAdmin:s6AmyxKy4QHzhCKm@arukcluster.v7i9lzc.mongodb.net/?retryWrites=true&w=majority";
const bcrypt = require('bcrypt');

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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

async function getUserByUsername(username) {
    try {
        const collection = client.db("CRMProvider").collection("users");
        const user = await collection.findOne({ username });
        return user;
    } catch (error) {
        console.error('Error getting user by username:', error);
        throw error;
    }
}

async function updateUser(username, updatedData) {
    try {
        const collection = client.db("CRMProvider").collection("users");

        // Перевіряємо, чи існує користувач з вказаним ім'ям
        const existingUser = await collection.findOne({ username });
        if (!existingUser) {
            throw new Error(`User with username ${username} not found`);
        }

        // Оновлюємо дані користувача
        const result = await collection.updateOne(
            { username },
            { $set: updatedData }
        );

        if (result.modifiedCount > 0) {
            console.log(`User ${username} updated successfully`);
            const logsCollection = client.db("CRMProvider").collection('logs');
            await logsCollection.insertOne({
                event: 'UpdateUser',
                username,
                status: 'success',
                timestamp: new Date(),
            });
        } else {
            console.log(`User ${username} not updated, data may be the same`);
        }
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

async function createUser(username, password, firstname, lastname, number, role) {
    try {
        const collection = client.db("CRMProvider").collection("users");
        const hashedPassword = await bcrypt.hash(password, 10); // "10" - кількість раундів для хешування

        const existingUser = await collection.findOne({ username });
        if (existingUser) {
            throw new Error(`User with username ${username} already exists`);
        }
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
                if(user.role === 'admin')
                {
                    const logsCollection = client.db("CRMProvider").collection('logs');
                    await logsCollection.insertOne({
                        event: 'authentication',
                        username,
                        status: 'success',
                        timestamp: new Date(),
                    });
                }

                return user;
            } else {
                console.log(`Authentication failed for user ${username}: Invalid password`);
                throw new Error('Invalid password');
            }
        } else {
            console.log(`Authentication failed for user ${username}: User not found`);
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error authenticating user:', error);
        throw error;
    }
}

module.exports = {
    connectToDatabase,
    createUser,
    updateUser,
    authenticateUser,
    getUserByUsername,
    closeDatabaseConnection
};