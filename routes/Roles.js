var express = require('express');
var router = express.Router();
var AuthController = require('../Controller/AuthController');
var UserManagementController = require('../Controller/UserManagementController');

var deleteFailed = false;
var role;

router.use(function (req, res, next) {
    var cookie = req.signedCookies['ID'];
    AuthController.checkAuth(res, req, function (authed, name) {
        if (authed) {//if the user is logged in
            AuthController.checkRole(name.toLowerCase(), function (err, dbRes) {
                if (dbRes.role == "admin") {
                    next();
                } else {
                    res.render('not_authed');
                }
            });
        } else {
            if (cookie != null) { //If they are not authed
                res.cookie("ID", cookie, {expires: new Date(1), httponly: true, signed: true});
            }//redirect them to login
            res.redirect('../login');
        }
    });
})
/**
 * If the users cookie is valid this extends the cookie and then renders the page
 * If it's not valid it deletes the cookie and then renders the login page
 */
/* GET home page. */
router.get('/create', function (req, res, next) {
    UserManagementController.getRoles(function (err, role) {
        res.render('roles', {"roles": role, "deleteFailed": deleteFailed});
        deleteFailed = false;
    });

});

/**
 * This attempts to add the role to the db
 */
router.post('/create', function (req, res, next) {
    if (req.body.RoleName != "" && !req.body.RoleName.includes(" ")) {
        UserManagementController.checkIfRoleExists(req.body.RoleName.toLowerCase(), function (err, result) {
            if (result != null) {//if the role already exists
                UserManagementController.getRoles(function (err, role) {
                    res.render('roles', {"roles": role, "emptyRole": false, "invalidRole": true});
                });
            } else {
                UserManagementController.addRole(req.body.RoleName.toLowerCase(), function (err, r) {
                    UserManagementController.getRoles(function (err, role) {
                        res.render('roles', {"roles": role});
                    });
                });
            }
        });
    } else {//if the field isnt populated
        UserManagementController.getRoles(function (err, role) {
            res.render('roles', {"roles": role, "emptyRole": true, "invalidRole": false});
        });

    }
});
//https://stackoverflow.com/questions/20089582/how-to-get-url-parameter-in-express-node-js
/**
 * This deletes the specified role if it's not in use
 */
router.get('/delete/:name', function (req, mainUiRes, next) {
    console.log("this got called");
    UserManagementController.deleteRole(req.params.name, function (err, res) {
        if (res == null) {
            deleteFailed = true;
            mainUiRes.redirect('/roles/create')
        } else {
            mainUiRes.redirect('/roles/create');
        }
    });


});
var editInUse = false;
var editInvalid = false;

/**
 * This lets the user edit the specified role
 */
router.get('/update/:name/', function (req, mainUiRes, next) {

    mainUiRes.render('edit_role', {"Role": req.params.name, "inUse": editInUse, "invalid": editInvalid});
    editInvalid = false;
    editInUse = false;

});
/**
 * This will take the url role name, update all the users to the req role and then update the role name
 */
router.post('/update/:name', function (req, mainUIRes, next) {
    UserManagementController.checkIfRoleExists(req.body.Role.toLowerCase(), function (err, res) {
        if (res == null) {
            if (req.body.Role.includes(" ") || req.body.Role == "") {
                editInvalid = true;
                mainUIRes.redirect('/roles/update/' + req.params.name);
            } else {
                UserManagementController.updateRole(req.params.name, req.body.Role.toLowerCase(), function (err, res) {
                    if (err) throw err;
                    mainUIRes.redirect('../');
                });
            }
        } else {//Role name is in use
            editInUse = true;
            mainUIRes.redirect('/roles/update/' + req.params.name);
        }
    })
});


module.exports = router;
