var express = require('express');
var AuthController = require('../Controller/AuthController');
var router = express.Router();

/**
 * This renders the login page
 */
router.get('/', function(req, res) {
    res.render('login');

});

/**
 * This attempts to login the user
 */
router.post('/', function (req,res){
    if (req.body.Username == "" || req.body.password == "") {
        res.render('login', {"empty": true});
    } else {
        //https://stackoverflow.com/questions/9304888/how-to-get-data-passed-from-a-form-in-express-node-js
        AuthController.checkPassword(req.body.Username, req.body.Password, function (err, result) {
            if (result) {//correct pass
                AuthController.addCookie(req.body.Username, function (err, hash) {
                    if (err) throw err;
                    //https://stackoverflow.com/questions/27978868/destroy-cookie-nodejs
                    res.cookie("ID", hash, {expires: new Date(Date.now() + 1800000), httponly: true, signed: true});
                    res.redirect('../');
                });
            } else {//failed pass or username
                res.render('login', {"failed": true});
            }
        });
    }

});

module.exports = router;
