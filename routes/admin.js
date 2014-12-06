var express = require('express');
var router = express.Router();

var passport = require('passport');
var authenticated = require('../middleware').authenticated;

router.get('/l', function (req, res) {
    res.render('login', {title: 'Logg inn'});
});
router.get('/r', authenticated, function(req, res) {
    res.render('index', {title: 'Ny side: ' +  req.hostname});
});

router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/'
}), function (req, res) {
    var url = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(url);
});


module.exports = router;
