const mongoose = require('mongoose')
const Schema = mongoose.Schema
const moment = require('moment')
const now = moment()

const UserSchema = new Schema({
    username: {
        type: String,
        trim: true,
        require: 'Username is required',
        unique: 'Username already exists',
    },
    email: {
        type: String,
        trim: true,
        unique: 'Email already exists',
        match: [/.+\@..+/, 'Please fill in valid email address'],
        required: 'Email is required',
    },
    password: {
        type: String,
        required: 'Password is required',
    },
    userCreated: {
        type: String,
        default: now.format('dddd, MMMM, Do YYYY, h:mm:ss a'),
    },
    drinks: [{ type: mongoose.Schema.ObjectId, ref: 'Drinks' }],
});

module.exports = mongoose.model('User', UserSchema);