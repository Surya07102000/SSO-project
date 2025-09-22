const express = require('express') 
const routes = require('./routes/index')
const errorHandler = require('./middlewares/errorHandler')
const { connectDb } = require('./config/db');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express()

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'] 
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json({limit: '100mb'}));

app.get('/', (req, res) => {
    res.send('Welcome To Centralized Application Management')
})

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/v1', routes);

app.use(errorHandler);

app.initDb = async () => {
  await connectDb();
};

module.exports = app;


