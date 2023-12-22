const admin = require('firebase-admin');
const serviceAccount = require('./providercrm-29c64-firebase-adminsdk-q9v33-bafccae22c.json');
const { initializeApp, cert } = require('firebase-admin/app');
const bcrypt = require("bcrypt");

admin.initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'providercrm-29c64.appspot.com',
});

const firestore = admin.firestore();
const bucket = admin.storage().bucket();


async function closeDatabaseConnection() {
    // Ваш код закриття з'єднання з Firebase Firestore
}

async function getUserByUsername(username) {
    try {
        const userRef = firestore.collection('users').doc(username);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new Error(`User with username ${username} not found`);
        }

        return userDoc.data();
    } catch (error) {
        console.error('Error getting user by username:', error);
        throw error;
    }
}

async function updateUser(username, updatedData) {
    try {
        const userRef = firestore.collection('users').doc(username);
        const existingUser = await userRef.get();

        if (!existingUser.exists) {
            throw new Error(`User with username ${username} not found`);
        }

        await userRef.update(updatedData);

        console.log(`User ${username} updated successfully`);
        const logsCollection = firestore.collection('logs');
        await logsCollection.add({
            event: 'UPDATE_USER',
            status: 'success',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            additionalInfo: 'Change data for ' + username
        });
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

async function changePassword(username, newPassword) {
    try {
        const userRef = firestore.collection('users').doc(username);
        const existingUser = await userRef.get();

        if (!existingUser.exists) {
            throw new Error(`User with username ${username} not found`);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userRef.update({ password: hashedPassword });

        console.log(`Password for user ${username} updated successfully`);
        const logsCollection = firestore.collection('logs');
        await logsCollection.add({
            event: 'CHANGE_PASSWORD',
            status: 'success',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            additionalInfo: 'Change password for ' + username
        });
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
}

async function createUser(username, password, firstname, lastname, number, role, email, address) {
    try {
        const existingUserQuery = await firestore.collection('users').where('username', '==', username).get();

        if (!existingUserQuery.empty) {
            throw new Error(`User with username ${username} already exists`);
        }

        const userCollection = firestore.collection('users');

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = ({
            username: username,
            password: hashedPassword,
            firstname: firstname,
            lastname: lastname,
            number: number,
            email: email,
            address: address,
            role: role || 'client',
        });

        await userCollection.add(user);

        const logsCollection = firestore.collection('logs');
        await logsCollection.add({
            event: 'REGISTRATION_USER',
            status: 'success',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            additionalInfo: 'Created new user: ' + username
        });

        console.log(`User ${username} created`);
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

async function getUsers() {
    try {
        let usersCollection = firestore.collection('users');

        // Додаємо фільтр за роллю користувача
        usersCollection = usersCollection.where('role', '==', 'client');

        // Отримуємо дані користувачів
        const snapshot = await usersCollection.get();

        // Формуємо масив з отриманих даних
        const users = snapshot.docs.map((doc) => {
            const userData = { id: doc.id, ...doc.data() };
            // Виключаємо поле "password" з результату
            delete userData.password;
            return userData;
        });

        return users;
    } catch (error) {
        console.error('Error getting users:', error);
        throw error;
    }
}

async function getUsersByIds(serviceIds) {
    try {
        const usersCollection = firestore.collection('users');
        const usersDocs = await Promise.all(serviceIds.map((serviceId) => usersCollection.doc(serviceId).get()));

        const users = usersDocs.map((serviceDoc) => {
            if (!serviceDoc.exists) {
                throw new Error(`Service with id ${serviceDoc.id} not found`);
            }
            return serviceDoc.data();
        });

        return users;
    } catch (error) {
        console.error('Error fetching services by ids:', error.message);
        throw error; // Повертаємо помилку назад
    }
}

async function deleteUsersByIds(usersIds) {
    try {
        const servicesCollection = firestore.collection('users');

        // Отримуємо масив документів сервісів за ідентифікаторами
        const usersDocs = await Promise.all(usersIds.map(async (userId) => {
            const serviceQuery = await servicesCollection.doc(userId).get();
            if (!serviceQuery.exists) {
                throw new Error(`Client with id ${userId} not found`);
            }
            return serviceQuery.ref;
        }));

        // Видаляємо сервіси
        await Promise.all(usersDocs.map(async (userDoc) => {
            await userDoc.delete();
        }));

        const logsCollection = firestore.collection('logs');
        await logsCollection.add({
            event: 'DELETE_USERS',
            status: 'success',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            additionalInfo: `Видалено рахунки з ідентифікаторами ${billsIds.join(', ')}`
        });
    } catch (error) {
        console.error('Error deleting bills by ids:', error);
        throw error;
    }
}

async function createService(serviceData) {
    try {
        const serviceName = serviceData.serviceName;

        // Перевірка, чи існує сервіс з такою назвою
        const existingServiceQuery = await firestore.collection('services').where('serviceName', '==', serviceName).get();

        if (!existingServiceQuery.empty) {
            throw new Error(`Service exists`);
        }

        // Додавання нового сервісу до колекції "services"
        const servicesCollection = firestore.collection('services');
        const createdServiceDoc = await servicesCollection.add(serviceData);
        const createdService = { id: createdServiceDoc.id, ...serviceData };

        console.log('Service created successfully:', createdService);

        const logsCollection = firestore.collection('logs');
        await logsCollection.add({
            event: 'CREATE_SERVICE',
            status: 'success',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            additionalInfo: 'Created new service: ' + serviceName
        });

        return createdService;
    } catch (error) {
        console.error('Error creating service:', error);
        throw error;
    }
}

async function updateServiceById(serviceId, updatedData) {
    try {
        const servicesCollection = firestore.collection('services');

        // Знаходимо сервіс за ідентифікатором
        const serviceDoc = await servicesCollection.doc(serviceId).get();

        if (!serviceDoc.exists) {
            throw new Error(`Service with id ${serviceId} not found`);
        }

        // Оновлюємо дані сервісу
        await serviceDoc.ref.update(updatedData);

        const logsCollection = firestore.collection('logs');
        await logsCollection.add({
            event: 'UPDATE_SERVICE',
            status: 'success',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            additionalInfo: `Updated service with id ${serviceId}`,
        });
    } catch (error) {
        console.error('Error updating service:', error);
        throw error;
    }
}

async function deleteServiceByName(serviceName) {
    try {
        const servicesCollection = firestore.collection('services');

        // Знаходимо сервіс за назвою
        const serviceQuery = await servicesCollection.where('serviceName', '==', serviceName).get();

        if (serviceQuery.empty) {
            throw new Error(`Service with name ${serviceName} not found`);
        }

        // Отримуємо документ сервісу
        const serviceDoc = serviceQuery.docs[0];

        // Видаляємо сервіс
        await serviceDoc.ref.delete();

        const logsCollection = firestore.collection('logs');
        await logsCollection.add({
            event: 'DELETE_SERVICE',
            status: 'success',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            additionalInfo: `Видалено сервіс ${serviceName}`
        });
    } catch (error) {
        console.error('Error deleting service by name:', error);
        throw error;
    }
}

async function deleteServicesByIds(serviceIds) {
    try {
        const servicesCollection = firestore.collection('services');

        // Отримуємо масив документів сервісів за ідентифікаторами
        const serviceDocs = await Promise.all(serviceIds.map(async (serviceId) => {
            const serviceQuery = await servicesCollection.doc(serviceId).get();
            if (!serviceQuery.exists) {
                throw new Error(`Service with id ${serviceId} not found`);
            }
            return serviceQuery.ref;
        }));

        // Видаляємо сервіси
        await Promise.all(serviceDocs.map(async (serviceDoc) => {
            await serviceDoc.delete();
        }));

        const logsCollection = firestore.collection('logs');
        await logsCollection.add({
            event: 'DELETE_SERVICES',
            status: 'success',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            additionalInfo: `Видалено сервіси з ідентифікаторами ${serviceIds.join(', ')}`
        });
    } catch (error) {
        console.error('Error deleting services by ids:', error);
        throw error;
    }
}


async function getServiceByName(serviceName) {
    try {
        const servicesCollection = firestore.collection('services');

        // Знаходимо сервіс за назвою
        const serviceQuery = await servicesCollection.where('serviceName', '==', serviceName).get();

        if (serviceQuery.empty) {
            return null; // Сервіс не знайдено
        }

        // Отримуємо документ сервісу
        const serviceDoc = serviceQuery.docs[0];

        // Повертаємо дані сервісу
        return serviceDoc.data();
    } catch (error) {
        console.error('Error getting service by name:', error);
        throw error;
    }
}

async function getServicesByIds(serviceIds) {
    try {
        const servicesCollection = firestore.collection('services');
        const serviceDocs = await Promise.all(serviceIds.map((serviceId) => servicesCollection.doc(serviceId).get()));

        const services = serviceDocs.map((serviceDoc) => {
            if (!serviceDoc.exists) {
                throw new Error(`Service with id ${serviceDoc.id} not found`);
            }
            return serviceDoc.data();
        });

        return services;
    } catch (error) {
        console.error('Error fetching services by ids:', error.message);
        throw error; // Повертаємо помилку назад
    }
}

async function getServiceById(serviceId) {
    try {
        const servicesCollection = firestore.collection('services');
        const serviceDoc = await servicesCollection.doc(serviceId).get();

        if (!serviceDoc.exists) {
            throw new Error(`Service with id ${serviceId} not found`);
        }

        return serviceDoc.data();
    } catch (error) {
        console.error('Error fetching service by id:', error.message);
        throw error; // Повертаємо помилку назад
    }
}

async function getServices(serviceType, status, searchQuery) {
    try {
        let servicesCollection = firestore.collection('services');

        // Додаємо фільтр за типом послуги, якщо він заданий
        if (serviceType) {
            servicesCollection = servicesCollection.where('serviceType', '==', serviceType);
        }

        // Додаємо фільтр за статусом, якщо він заданий
        if (status) {
            servicesCollection = servicesCollection.where('status', '==', status);
        }

        // Додаємо фільтр для пошуку за ключовими словами
        if (searchQuery) {
            const normalizedQuery = searchQuery.toLowerCase();

            // Фільтр за назвою послуги або описом
            servicesCollection = servicesCollection.where('serviceName', '>=', normalizedQuery)
                .where('serviceName', '<=', normalizedQuery + '\uf8ff')
                .where('serviceDescription', '>=', normalizedQuery)
                .where('serviceDescription', '<=', normalizedQuery + '\uf8ff');

            // Фільтр за іменем плану вкладеного в servicePlans
            servicesCollection = servicesCollection.where('servicePlans.planName', 'array-contains', normalizedQuery);
        }

        // Отримуємо дані послуг
        const snapshot = await servicesCollection.get();

        // Формуємо масив з отриманих даних
        const services = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        return services;
    } catch (error) {
        console.error('Error getting services:', error);
        throw error;
    }
}

async function authenticateUser(username, password) {
    try {
        const userRef = firestore.collection('users');

        const serviceQuery = await userRef.where('username', '==', username).get();

        const userDoc = serviceQuery.docs[0];
        if (userDoc.exists) {
            const user = userDoc.data();
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                console.log(`User ${username} authenticated`);

                if (user.role === 'admin') {
                    const logsCollection = firestore.collection('logs');
                    await logsCollection.add({
                        event: 'AUTHENTICATION',
                        status: 'success',
                        timestamp: admin.firestore.FieldValue.serverTimestamp(),
                        additionalInfo: 'Authenticate user with id: ' + user.id
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


async function getPayments() {
    try {
        let paymentsCollection = firestore.collection('payments');
        // Отримуємо дані користувачів
        const snapshot = await paymentsCollection.get();

        // Формуємо масив з отриманих даних
        const payments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        return payments;
    } catch (error) {
        console.error('Error getting users:', error);
        throw error;
    }
}

async function getPaymentsByBillId(billId) {
    try {
        const paymentsCollection = firestore.collection('payments');
        const paymentsQuery = await paymentsCollection.where('billId', '==', billId).get();

        const payments = paymentsQuery.docs.map((paymentDoc) => ({ id: paymentDoc.id, ...paymentDoc.data() }));
        return payments;
    } catch (error) {
        console.error('Error fetching payments by bill id:', error.message);
        throw error; // Повертаємо помилку назад
    }
}

async function createPayment(paymentData) {
    try {
        const billsCollection = firestore.collection('payments');

        // Додаємо новий рахунок до колекції "bills"
        const newPaymentRef = await billsCollection.add({
            userId: paymentData.userId,
            amount: paymentData.amount,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            paymentMethod: paymentData.paymentMethod,
        });

        // Отримуємо доданий рахунок
        const newPaymentDoc = await newPaymentRef.get();

        const logsCollection = firestore.collection('logs');
        await logsCollection.add({
            event: 'CREATE_PAYMENT',
            status: 'success',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            additionalInfo: 'Created new payment: ' + newPaymentDoc.id
        });


        return { id: newPaymentDoc.id, ...newPaymentDoc.data() };
    } catch (error) {
        console.error('Error creating bill:', error);
        throw error;
    }
}


async function getBills() {
    try {
        // Отримуємо дані рахунків (bills)
        const billsCollection = firestore.collection('bills');
        const snapshot = await billsCollection.get();

        // Формуємо масив з отриманих даних
        const bills = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        return bills;
    } catch (error) {
        console.error('Error getting bills:', error);
        throw error;
    }
}

async function createBill(userId, amount, dueDate, serviceId, tariffPlanId) {
    try {
        const billsCollection = firestore.collection('bills');

        // Додаємо новий рахунок до колекції "bills"
        const newBillRef = await billsCollection.add({
            userId: userId,
            amount: amount,
            dueDate: dueDate,
            serviceId: serviceId,
            tariffPlanId: tariffPlanId,
            isPaid: false, // За замовчуванням, рахунок ще не оплачено
            // Додайте інші поля, якщо потрібно
        });

        // Отримуємо доданий рахунок
        const newBillDoc = await newBillRef.get();

        const logsCollection = firestore.collection('logs');
        await logsCollection.add({
            event: 'CREATE_BILL',
            status: 'success',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            additionalInfo: 'Created new bill for: ' + userId
        });


        return { id: newBillDoc.id, ...newBillDoc.data() };
    } catch (error) {
        console.error('Error creating bill:', error);
        throw error;
    }
}

async function updateBillById(billId, updatedData) {
    try {
        const servicesCollection = firestore.collection('bills');

        // Знаходимо сервіс за ідентифікатором
        const serviceDoc = await servicesCollection.doc(billId).get();

        if (!serviceDoc.exists) {
            throw new Error(`Bill with id ${billId} not found`);
        }

        // Оновлюємо дані сервісу
        await serviceDoc.ref.update(updatedData);

        const logsCollection = firestore.collection('logs');
        await logsCollection.add({
            event: 'UPDATE_BILL',
            status: 'success',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            additionalInfo: `Оновлено дані рахунку з id ${billId}`,
        });
    } catch (error) {
        console.error('Error updating bill:', error);
        throw error;
    }
}

async function deleteBillsByIds(billsIds) {
    try {
        const servicesCollection = firestore.collection('bills');

        // Отримуємо масив документів сервісів за ідентифікаторами
        const billsDocs = await Promise.all(billsIds.map(async (billId) => {
            const serviceQuery = await servicesCollection.doc(billId).get();
            if (!serviceQuery.exists) {
                throw new Error(`Bill with id ${billId} not found`);
            }
            return serviceQuery.ref;
        }));

        // Видаляємо сервіси
        await Promise.all(billsDocs.map(async (serviceDoc) => {
            await serviceDoc.delete();
        }));

        const logsCollection = firestore.collection('logs');
        await logsCollection.add({
            event: 'DELETE_BILLS',
            status: 'success',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            additionalInfo: `Видалено рахунки з ідентифікаторами ${billsIds.join(', ')}`
        });
    } catch (error) {
        console.error('Error deleting bills by ids:', error);
        throw error;
    }
}

async function getBillById(billId) {
    try {
        const billDoc = await firestore.collection('bills').doc(billId).get();

        if (!billDoc.exists) {
            throw new Error(`Bill with id ${billId} not found`);
        }

        const bill = { id: billDoc.id, ...billDoc.data() };
        return bill;
    } catch (error) {
        console.error('Error fetching bill by id:', error.message);
        throw error; // Повертаємо помилку назад
    }
}

async function getBillsByUserId(userId) {
    try {
        const billsCollection = firestore.collection('bills');
        const billsQuery = await billsCollection.where('userId', '==', userId).get();

        const bills = billsQuery.docs.map((billDoc) => ({ id: billDoc.id, ...billDoc.data() }));
        return bills;
    } catch (error) {
        console.error('Error fetching bills by user id:', error.message);
        throw error; // Повертаємо помилку назад
    }
}

async function getBillsByIds(billIds) {
    try {
        const billsCollection = firestore.collection('bills');
        const billDocs = await Promise.all(billIds.map((billId) => billsCollection.doc(billId).get()));

        const bills = billDocs.map((billDoc) => {
            if (!billDoc.exists) {
                throw new Error(`Bill with id ${billDoc.id} not found`);
            }
            return { id: billDoc.id, ...billDoc.data() };
        });

        return bills;
    } catch (error) {
        console.error('Error fetching bills by ids:', error.message);
        throw error; // Повертаємо помилку назад
    }
}

async function getLogs() {
    try {
        // Отримуємо дані логів (logs)
        const logsCollection = firestore.collection('logs');

        // Отримуємо останні 8 логів, сортуючи за датою у зворотньому порядку
        const snapshot = await logsCollection.orderBy('timestamp', 'desc').limit(8).get();

        // Формуємо масив з отриманих даних
        const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        return logs;
    } catch (error) {
        console.error('Error getting logs:', error);
        throw error;
    }
}

module.exports = {
    admin,
    createUser,
    updateUser,
    changePassword,
    authenticateUser,
    getUserByUsername,
    getUsers,
    getUsersByIds,
    deleteUsersByIds,
    createService,
    updateServiceById,
    deleteServiceByName,
    deleteServicesByIds,
    getServiceByName,
    getServicesByIds,
    getServiceById,
    getServices,
    getPayments,
    getPaymentsByBillId,
    createPayment,
    getBills,
    getBillById,
    getBillsByIds,
    getBillsByUserId,
    createBill,
    updateBillById,
    deleteBillsByIds,
    getLogs,
    closeDatabaseConnection,
    bucket,
};
