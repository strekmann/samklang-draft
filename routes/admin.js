var express = require('express');
var router = express.Router();

var passport = require('passport');
var shortid = require('short-mongo-id');
var authenticated = require('../middleware').authenticated;

var Site = require('../models/sites').Site,
    Group = require('../models/groups').Group;

router.get('/i', function (req, res) {
    res.render('login', {title: 'Logg inn'});
});
router.get('/o', function (req, res) {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});
router.route('/r')
.all(authenticated)
.get(function (req, res) {
    var first_name = req.user.name.split(" ")[0];
    var site_name = first_name + 's nettsted';
    if (first_name.match(/s$/)) {
        site_name = first_name + "' nettsted";
    }
    res.render('page', {title: 'Ny side: ' +  req.hostname, site_id: req.hostname, site_name: site_name});
})
.post(function (req, res, next) {
    var site_name = req.body.site_name;
    var query;
    var domain_pattern = new RegExp('^(\\S+)\\.' + process.env.SAMKLANG_DOMAIN + '$', 'i');
    var domain_match = domain_pattern.exec(req.hostname);
    if (!domain_match) {
        // should never happen
        return next(new Error("Unrecognized domain pattern"));
    }
    else {
        var site_id = domain_match[1];
        Site.findById(site_id, function (err, site) {
            if (err) { console.error(err); }
            if (site) {
                if (req.user._id !== site.creator) {
                    // already exists, not allowed to change site name
                    return next(new Error("Not allowed"));
                }
                else {
                    // update
                    site.name = site_name;
                    site.save(function (err) {
                        if (err) { console.error(err); }
                        res.redirect('/');
                    });
                }
            }
            else {
                // new site
                site = new Site();
                site._id = domain_match[1];
                site.name = site_name;
                site.creator = req.user._id;
                site.save(function (err) {
                    if (err) {
                        return next(new Error("Could not save"));
                    }
                    var group = new Group();
                    group._id = shortid();
                    group.site = site_id;
                    group.name = 'Administratorer';
                    group.creator = site.creator;
                    group.users = [ site.creator ];
                    group.save(function (err) {
                        if (err) { return next(err); }
                        res.redirect('/');
                    });
                });
            }
        });
    }
});

router.get('/facebook', passport.authenticate('facebook', {
    scope: ['email']
}));

router.get('/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/'
}), function (req, res) {
    var url = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(url);
});

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback', function (req, res) {
    if (req.hostname === process.env.SAMKLANG_DOMAIN) {
        if (req.params.state) {
            res.redirect(req.protocol + '://' + req.params.state + ':' + req.port + req.originalUrl);
        }
    }
}, passport.authenticate('google', {
    failureRedirect: '/'
}), function (req, res) {
    var url = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(url);
});

module.exports = router;
