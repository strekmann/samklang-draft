var express = require('express');
var passport = require('passport');
var router = express.Router();

var User = require('../models/users').User;

router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/'
}), function (req, res) {
    var url = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(url);
});

module.exports = router;
