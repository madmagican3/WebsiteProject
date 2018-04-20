var express = require('express');
var AuthController = require('../Controller/AuthController');
var router = express.Router();

//AuthController.createUser("Admin","Test","Admin");
//AuthController.createUser("TestUser","test123", "User");
//newuser,123
//newuser2,123 etc as needed

/**
 * This renders the register page
 */
router.get('/', function (req, res) {
    res.render('register');
});

/**
 * This will check the register attempt then if it's correct try to add it to the db
 */
router.post('/', function (req, resmain) {
    if (req.body.VerificationPass == req.body.Password) {//pass is the same
        if (req.body.Username.includes(" ") || req.body.Password == "" || req.body.Username == "") {
            resmain.render('register', {"invalidFields": true})
        } else {
            AuthController.checkIfUserExists(req.body.Username.toLowerCase(), function (err, res) {
                if (res == null) {//user is a new username
                    AuthController.createUser(req.body.Username.toLowerCase(), req.body.Password, "Pending", function (err, res) {
                        AuthController.addCookie(req.body.Username, function (err, hash) {//log the user in
                            if (err) throw err;
                            resmain.cookie("ID", hash, {
                                expires: new Date(Date.now() + 1800000),
                                httponly: true,
                                signed: true
                            });
                            resmain.redirect('../');
                        });
                    });
                } else {//user already exists
                    resmain.render('register', {"alreadyExists": true});
                }
            });
        }
    } else {//if the passwords dont match
        resmain.render('register', {"nonMatchingPass": true});
    }
});

module.exports = router;
