var express = require('express');
var router = express.Router();
var AuthController = require('../Controller/AuthController');
var UserManagementController = require('../Controller/UserManagementController');
var request = require('request');


var invalidUser = false;
var role;

router.use(function (req, res, next) {
    var cookie = req.signedCookies['ID'];

    AuthController.checkAuth(res, req, function (authed, name) {
        if (authed) {//if the user is logged in
            AuthController.checkRole(name.toLowerCase(), function (err, dbRes) {
                role = dbRes;
                next();
            });
        } else {
            if (cookie != null) { //If they are not authed
                res.cookie("ID", cookie, {expires: new Date(1), httponly: true, signed: true});
            }//redirect them to login
            res.redirect('../login');
        }
    });

});

/**
 * This checks to see if a user is valid then renders the correct page
 */
/* GET home page. */
router.get('/', function (req, res, next) {

    if (role.role == "admin") {//only admins should be able to change a users status
        UserManagementController.getUsers(function (err, res2) {
            if (err) throw err;
            res.render('user_management', {"users": res2});
        });
    } else {//else tell them they're not authorised
        res.render('not_authed');
    }

});
router.get('/update/:name', function (req, res, next) {
    if (role.role == "admin") {//only admins should be able to change a users status
        //http://expressjs.com/en/api.html
        UserManagementController.getUser(req.params.name.toLowerCase(), function (err, result) {
            if (err)//if we dont find the user
                res.render('error', {"message": "That user does not exist"});
            UserManagementController.getRoles(function (err, resArray) {
                if (err) throw err;
                res.render('edit_user', {"user": result, "roles": resArray, "invalidUser": invalidUser});
            });
        });
    } else {//else tell them they're not authorised
        res.render('not_authed');
    }
});

router.post('/update/:name', function (req, resmain) {
    if (role.role == "admin"){
        var dontRun = false;
        UserManagementController.getUser(req.params.name, function (err, res) {
            if (req.body.Username != req.params.name) {//update username
                if (req.body.Username.includes(" ") || req.body.Username == "") {
                    invalidUser = true;
                    dontRun = true;
                    resmain.redirect('/usermanagement/update' + req.params.name);
                } else {
                    UserManagementController.updateUsername(res.id, req.body.Username);
                }
            }
            if (req.body.Password != "") {//update password
                UserManagementController.updatePassword(res.id, req.body.Password);
            }
            if (req.body.roles != res.role) {//update role
                UserManagementController.updateUserRole(res.id, req.body.roles);
            }
            setTimeout(function () {
                if (!dontRun) {
                    resmain.redirect('/usermanagement');
                }
            }, 1000);
        });
    }else {
        resmain.render('not_authed');
    }


});
router.get('/delete/:name', function (req, resmain, next) {
    if (role.role == "admin"){
        request.post('http://localhost:3000/usermanagement/delete/' + req.params.name);
        resmain.redirect('/usermanagement');
    }else {
        resmain.render('not_authed');
    }

});
router.post('/delete/:name', function (req, resmain, next) {
    if (role.role=="admin"){
        UserManagementController.deleteUser(req.params.name, function (err, res) {
        });
    }else {
        resmain.render('not_authed');
    }

})

module.exports = router;
