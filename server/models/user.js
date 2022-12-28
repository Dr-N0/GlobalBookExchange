const mongoose = require('mongoose');

const nameSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
},
{
    _id: false,
});

const addressSchema = new mongoose.Schema({
    addressOne: {
        type: String,
        required: true,
    },
    addressTwo: String,
    addressThree: String,
    cityLine: {
        type: String,
        required: true,
    },
    countryLine: {
        type: String,
        required: true,
    },
},
{
    _id: false,
});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    name: {
        type: nameSchema,
        required: true,
    },
    address: {
        type: addressSchema,
    },
    books: {
        type: [String],
    }
});

module.exports = mongoose.model('User', userSchema);
