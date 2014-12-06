module.exports.authenticated = function(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    req.session.returnTo = req.originalUrl;
    res.redirect('/_/l');
};
