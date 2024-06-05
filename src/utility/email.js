const nodemailer = require('nodemailer');


const createToken = require('./createToken');


const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'tim.ben1248@gmail.com',
    pass: 'dbyc lhqf slei oure',
  },
});




exports.SendEmailUtility = async (EmailTo, EmailText, EmailSubject) => {
  let mailOptions = {
    from: 'MaxLive-Technologies  <tim.ben1248@gmail.com>',
    to: EmailTo,
    subject: EmailSubject,
    text: EmailText,
  };

  return new Promise((resolve) => {
    transporter.sendMail(mailOptions, (err, info) => {
      console.log({ info });
      if (err) {
        resolve(err);
      }
      resolve(info);
    });
  });
};



