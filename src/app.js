const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
const middlewares = require('./middlewares');
const app = express();
const fetch = require('node-fetch');
app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined', {
        skip: function(req, res) { return res.statusCode < 400 }
    }));
    app.get('/', async(req, res) => {
        res.json({ meg: "Production mode 🎉" });
    });
} else {
    app.use(morgan('dev'));
    app.get('/', async(req, res) => {
        res.json({ meg: "Dev mode💩" });
    });
}

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;