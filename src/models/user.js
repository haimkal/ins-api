const mongoose = require ('mongoose');

const User = mongoose.model('User', {
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    avatar: String,
    createdAt: {
        type: Date,
        required: true,
        default: ()=> new Date()
    }
});

module.exports = User;


