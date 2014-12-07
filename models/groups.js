var mongoose = require('mongoose');

var GroupSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    site: {type: String, required: true},
    users: [{type: String, ref: 'User'}],
    creator: {type: String, ref: 'User'},
    created: {type: Date, default: Date.now}
});

module.exports = {
    Group: mongoose.model('Group', GroupSchema)
};
