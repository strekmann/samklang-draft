var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var shortid = require('short-mongo-id');

var routes = require('./routes/index');
var admin = require('./routes/admin');
var users = require('./routes/users');

var User = require('./models/users').User;

var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRET || 'keyboard cat',
    saveUninitialized: false,
    resave: false,
    cookie: {domain: '.' + process.env.SAMKLANG_DOMAIN},
    store: new MongoStore({url: process.env.SAMKLANG_DB})
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(user_id, done) {
    User.findById(user_id, 'name', function(err, user){
        if (err) {
            return done(err);
        }
        if (!user) {
            done(null, null);
        }
        done(null, user);
    });
});


if (process.env.SAMKLANG_GOOGLE_APP_ID && process.env.SAMKLANG_GOOGLE_APP_SECRET) {
    var port_extension = '';
    var port = process.env.PORT || 3000;
    if (port.length === 4) {
        port_extension = ':' + port;
    }
    passport.use(new GoogleStrategy({
        clientID: process.env.SAMKLANG_GOOGLE_APP_ID,
        clientSecret: process.env.SAMKLANG_GOOGLE_APP_SECRET,
        callbackURL: process.env.PROTOCOL + '://' + process.env.SAMKLANG_DOMAIN + port_extension + '/_/google/callback',
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
        if (!profile) {
            done(new Error("Could not log you in at Google"));
        }
        else {
            if (req.user) {
                req.user.google_id = profile.id;
                req.user.google_picture_url = profile._json.picture;
                req.user.google_profile_url = profile._json.link;
                req.user.google_locale = profile._json.locale;
                if (profile.emails && profile.emails[0] && profile.emails[0].value) {
                    if (!req.user.email) {
                        req.user.email = profile.emails[0].value;
                    }
                    if (!req.user.google_email) {
                        req.user.google_email = profile.emails[0].value;
                    }
                }
                req.user.save(function (err, user) {
                    req.session.returnTo = '/users/' + req.user.username;
                    if (user) {
                    }
                    return done(err, user);
                });
            }
            else {
                User.findOne({google_id: profile.id}, function (err, user) {
                    if (!user) {
                        user = new User();
                        user._id = shortid();
                        user.name = profile.displayName;
                        user.picture_url = profile._json.picture;
                        user.google_id = profile.id;
                    }
                    user.google_picture_url = profile._json.picture;
                    user.google_profile_url = profile._json.link;
                    user.google_locale = profile._json.locale;
                    if (profile.emails && profile.emails[0] && profile.emails[0].value) {
                        if (!user.email) {
                            user.email = profile.emails[0].value;
                        }
                        if (!user.google_email) {
                            user.google_email = profile.emails[0].value;
                        }
                    }
                    user.save(function (err) {
                        if (err) { console.error(err); }
                        return done(err, user);
                    });
                });
            }
        }
    }));
}
if (process.env.SAMKLANG_FACEBOOK_APP_ID && process.env.SAMKLANG_FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.SAMKLANG_FACEBOOK_APP_ID,
        clientSecret: process.env.SAMKLANG_FACEBOOK_APP_SECRET,
        callbackURL: '/_/facebook/callback',
        authorizationURL: 'https://www.facebook.com/v2.2/dialog/oauth',
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
        if (!profile) {
            done(new Error("Could not log you in at Facebook"));
        }
        else {
            if (req.user) {
                req.user.facebook_id = profile.id;
                req.user.facebook_profile_url = profile.profileUrl;
                req.user.facebook_picture_url = req.user.get_facebook_image_url();
                req.user.facebook_locale = profile._json.locale;
                req.user.facebook_timezone = profile._json.timezone;
                req.user.facebook_verified = profile._json.verified;
                req.user.facebook_updated_time = profile._json.updated_time;
                if (profile.emails && profile.emails[0] && profile.emails[0].value) {
                    if (!req.user.email) {
                        req.user.email = profile.emails[0].value;
                    }
                    if (!req.user.facebook_email) {
                        req.user.facebook_email = profile.emails[0].value;
                    }
                }
                if (!req.user.picture_url) {
                    req.user.picture_url = req.user.facebook_picture_url;
                }
                req.user.save(function (err, user) {
                    req.session.returnTo = '/users/' + req.user.username;
                    if (user) {
                        //req.flash('success', 'Du kan nå logge inn med Facebook-kontoen');
                    }
                    return done(err, user);
                });
            }
            else {
                User.findOne({facebook_id: profile.id}, function (err, user) {
                    if (!user) {
                        user = new User();
                        user._id = shortid();
                        user.name = profile.displayName;
                        user.facebook_id = profile.id;
                        user.facebook_picture_url = user.get_facebook_image_url();
                    }
                    user.facebook_profile_url = profile.profileUrl;
                    user.facebook_locale = profile._json.locale;
                    user.facebook_timezone = profile._json.timezone;
                    user.facebook_verified = profile._json.verified;
                    user.facebook_updated_time = profile._json.updated_time;
                    if (profile.emails && profile.emails[0] && profile.emails[0].value) {
                        if (!user.email) {
                            user.email = profile.emails[0].value;
                        }
                        if (!user.facebook_email) {
                            user.facebook_email = profile.emails[0].value;
                        }
                    }
                    if (!user.picture_url) {
                        user.picture_url = user.facebook_picture_url;
                    }
                    user.save(function (err) {
                        if (err) { console.error(err); }
                        return done(err, user);
                    });
                });
            }
        }
    }));
}
app.use(function (req, res, next) {
    res.locals.active_user = req.user;
    next();
});

app.use('/', routes);
app.use('/_', admin);
app.use('/users', users);

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.error(err.stack);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
