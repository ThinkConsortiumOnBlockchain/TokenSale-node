'use strict';

const nodemailer   = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'smartsensetab@gmail.com',
        pass: 'ntgmnjmtczleqgce'
    }
});

module.exports.transporter = transporter;