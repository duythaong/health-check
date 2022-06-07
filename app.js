require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const app = express();
app.use(cors());

const indexRouter = require('./routes/index');
const cron = require('./cron');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// mouting route
app.use('/api', indexRouter);

cron.check();

module.exports = app;
