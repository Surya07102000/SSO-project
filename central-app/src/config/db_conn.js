const { Sequelize } = require('sequelize');
const {dbConfig, node_env} = require('./config'); 

const sequelizeConfig = {
  host: dbConfig.host,
  dialect: dbConfig.dialect, 
  logging: dbConfig.logging ? console.log : false, // Enable logging if set to 'true'
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

if (node_env === 'production') {
  sequelizeConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, sequelizeConfig);

module.exports = {sequelize};
