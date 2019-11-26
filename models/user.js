const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    summoners: [{type: mongoose.Schema.Types.ObjectId, ref: 'Summoners'}],
    googleId: String
    }, {
    timestamps: true
    });



module.exports = mongoose.model('User', userSchema);
