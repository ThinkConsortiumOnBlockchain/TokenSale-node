'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var refercodeSchema = new Schema({
    email : {
        type  : String
    },
    code : {
        type  : String
    },
    ipAddress : {
        type  : String
    },
    ethereumAddress : {
        type  : String
    },
    userId    : {
        type  : mongoose.Schema.Types.ObjectId,
        ref   : 'User'
    }
}, {timestamps: true});

module.exports = mongoose.model('Refercode', refercodeSchema, 'refercode');