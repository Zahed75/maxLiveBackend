const nodemailer = require('nodemailer');

//emails


const createToken = require('./createToken');
const { BRAND_MANAGER } = require('../config/constants');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: '',
    pass: '',
  },
});

// const transporter = nodemailer.createTransport({
//   host: 'sandbox.smtp.mailtrap.io',
//   port: 2525,
//   auth: {
//     user: 'f1d6b9428c38b9',
//     pass: '5dd5f51f90845a',
//   },
// });



