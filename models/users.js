var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    email: {type: String, required: true},
    picture_url: {type: String},
    facebook_id: {type: String, unique: true, sparse: true},
    facebook_email: {type: String},
    facebook_picture_url: {type: String},
    facebook_profile_picture: {type: String},
    facebook_locale: {type: String},
    facebook_timezone: {type: Number},
    facebook_verified: {type: Boolean},
    facebook_updated_time: {type: Date},
    google_id: {type: String, unique: true, sparse: true},
    google_email: {type: String},
    google_profile_url: {type: String},
    google_picture_url: {type: String},
    google_locale: {type: String},
    is_active: {type: Boolean, default: true},
    created: {type: Date, default: Date.now}
});

UserSchema.methods.get_facebook_image_url = function (requested_size) {
    var size = requested_size || 500;
    return 'https://graph.facebook.com/' + this.facebook_id + '/picture?type=square&width=' + size + '&height=' + size;
};

module.exports = {
    User: mongoose.model('User', UserSchema)
};
