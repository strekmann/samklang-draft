var express = require('express');
var router = express.Router();

var Site = require('../models/sites').Site;

/* GET home page. */
router.get('/', function(req, res) {
    var query;
    var domain_pattern = new RegExp('^(\\S+)\\.' + process.env.SAMKLANG_DOMAIN + '$', 'i');
    var domain_match = domain_pattern.exec(req.hostname);
    if (domain_match){
        query = {_id: domain_match[1]};
    }
    else {
        query = {custom_domain: req.hostname};
    }

    Site.findOne(query, function (err, site) {
        if (err) { console.log(err); }
        if (site) {
            res.render('index', { title: site._id, site: site });
        }
        else {
            res.status(404);
            res.render('no-site', {title: "Nettstedet finnes ikke", domain: req.hostname});
        }
    });
});

module.exports = router;
