var express = require('express');
var router = express.Router();
var AuthController = require('../Controller/AuthController');

/**
 * If the users cookie is valid this extends the cookie and then renders the page
 * If it's not valid it deletes the cookie and then renders the login page
 */
/* GET home page. */
router.get('/', function (req, res, next) {
    var cookie = req.signedCookies['ID'];
    if (cookie != null) {
        res.cookie("ID", cookie, {expires: new Date(1), httponly: true, signed: true});
    }
    AuthController.deleteCookie(cookie);
    res.render('logout');
});


module.exports = router;
