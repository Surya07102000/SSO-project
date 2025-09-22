require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3001,
    node_env: process.env.NODE_ENV ,
    dbConfig: {
        host: process.env.DB_HOST ,
        dialect: process.env.DB_DIALECT , 
        database: process.env.DB_NAME ,
        username: process.env.DB_USER ,
        password: process.env.DB_PASSWORD ,
        logging: process.env.DB_LOGGING === 'true', 
        port: process.env.DB_PORT , 
        sync: process.env.DB_SYNC === 'yes' ,

    },
    authConfig: {
        JWT_SECRET : process.env.JWT_SECRET ,
        JWT_SECRET_REFRESH : process.env.JWT_SECRET_REFRESH ,
        JWT_ACCESS_EXPIRY : process.env.JWT_ACCESS_EXPIRY ,
        JWT_REFRESH_EXPIRY : process.env.JWT_REFRESH_EXPIRY ,
    },
};
