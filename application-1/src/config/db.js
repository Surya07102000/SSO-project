const {sequelize} = require('./db_conn');
const { dbConfig } = require('./config');
require('../model/init-models');

const connectDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        await sequelize.sync({ alter: dbConfig.sync });
        console.log('Database tables synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
};

module.exports = {
    sequelize,
    connectDb
};