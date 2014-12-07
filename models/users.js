var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    email: {type: String, required: true},
    facebook_id: {type: String, unique: true, sparse: true},
    facebook_access_token: {type: String},
    facebook_profile_url: {type: String},
    facebook_locale: {type: String},
    facebook_timezone: {type: Number},
    facebook_verified: {type: Boolean},
    facebook_updated_time: {type: Date},
    is_active: {type: Boolean, default: true},
    created: {type: Date, default: Date.now}
});

UserSchema.methods.facebook_image_url = function (requested_size) {
    var size = requested_size || 200;
    return 'https://graph.facebook.com/' + this.facebook.id + '/picture?type=square&width=' + size + '&height=' + size;
};

module.exports = {
    User: mongoose.model('User', UserSchema)
};
