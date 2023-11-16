const mongoose = require('mongoose');

// Define a User schema
const UsersSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    user_registered: Date,
    user_status: String
});


module.exports = mongoose.model('User', UsersSchema);
