const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const routes = require('./src/routes');
const { connectWithDB } = require('./src/config/mongo');
const { handleError } = require('./src/utility/errors.js');

const app = express();

// Trust proxy settings
app.set('trust proxy', 1);  // Change the parameter according to your proxy setup

// Security Middleware Implement
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Serve static files from the 'upload' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

// CORS CONFIGURATIONS
const whitelist = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3004',
  'http://localhost:3005',
  '*',
];
const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    return callback(null, true);
  },
};

app.use(cors(corsOptions));

// Request Rate Limit
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3000 });
app.use(limiter);

// Mongo DB Database Connection
connectWithDB();

// Routing Implement
app.use('/api/v1', routes);
app.use('/health-check', (req, res) => res.status(200).json('Working'));
app.use(handleError);

// Undefined Route Implement
app.use('*', (req, res) => {
  res.status(404).json({ status: 'fail', data: 'Server is Okay,its Undefined Route' });
});

module.exports = app;
