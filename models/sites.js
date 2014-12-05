var mongoose = require('mongoose');

var SiteSchema = new mongoose.Schema({
    _id: {type: String, unique: true, required: true},
    custom_domain: {type: String, unique: true},
    name: {type: String, required: true},
    slogan: {type: String},
    description: {type: String},
    visitor_address: {type: String},
    mail_address: {type: String},
    postcode: {type: String},
    city: {type: String},
    email: {type: String},
    entity_id: {type: String},
    local_bank_account: {type: String},
    international_bank_account: {type: String},
    created: {type: Date, default: Date.now},
    creator: {type: String, ref: 'User'}
});

module.exports = {
    Site: mongoose.model('Site', SiteSchema)
};
