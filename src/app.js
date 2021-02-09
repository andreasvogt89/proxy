const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
const middlewares = require('./middlewares');
const app = express();
const fetch = require('node-fetch');
const logger = require('./logger');
app.use(helmet());
app.use(cors());
app.use(express.json());
var whitelist = ['http://localhost:8080'];
whitelist.push(process.env.AllOWED_DOMAIN);
var corsOptions = {
    origin: function(origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}


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

/**
 * Redirect GET request with Bearer token
 */
app.post('/rd', cors(corsOptions), async(req, res, next) => {
    await fetch(req.body.url, {
            "headers": {
                "accept": "*/*",
                "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                "authorization": `Bearer ${req.body.access_token}`,
                "sec-gpc": "1"
            },
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        }).then(result =>
            result.json()
        )
        .then(jsonResult => {
            res.send(jsonResult);
        }).catch((err) => {
            logger.error(err);
            next(err);
        });
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;