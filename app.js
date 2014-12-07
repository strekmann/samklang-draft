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
    FacebookStrategy = require('passport-facebook').Strategy;

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
            return callback(err.message, null);
        }
        if (!user) {
            return callback("Could not find user "+ user_id);
        }
        done(null, user);
    });
});

if (process.env.SAMKLANG_FACEBOOK_APP_ID && process.env.SAMKLANG_FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.SAMKLANG_FACEBOOK_APP_ID,
        clientSecret: process.env.SAMKLANG_FACEBOOK_APP_SECRET,
        callbackURL: '/_/facebook/callback',
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
        if (req.user) {
            req.user.facebook_id = profile.id;
            req.user.facebook_access_token = accessToken;
            req.user.facebook_profile_url = profile.profileUrl;
            req.user.facebook_locale = profile._json.locale;
            req.user.facebook_timezone = profile._json.timezone;
            req.user.facebook_verified = profile._json.verified;
            req.user.facebook_updated_time = profile._json.updated_time;
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
                    user.email = profile.emails[0].value;
                    user.facebook_id = profile.id;
                }
                user.facebook_access_token = accessToken;
                user.facebook_profile_url = profile.profileUrl;
                user.facebook_locale = profile._json.locale;
                user.facebook_timezone = profile._json.timezone;
                user.facebook_verified = profile._json.verified;
                user.facebook_updated_time = profile._json.updated_time;
                user.save(function (err) {
                    if (err) { console.error(err); }
                    return done(err, user);
                });
            });
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
