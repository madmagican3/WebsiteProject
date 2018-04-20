var express = require('express');
var AuthController = require('../Controller/AuthController');
var router = express.Router();
var MongoController = require('../Controller/MongoController');
var UserManagementController = require('../Controller/UserManagementController');
var EventController = require('../Controller/EventController');
//https://stackoverflow.com/questions/33695893/express-postman-req-body-is-empty
var bodyParser = require('body-parser').json();
var basicAuth = require('express-basic-auth');

//https://scotch.io/tutorials/build-a-restful-api-using-node-and-express-4

/**
 * This is used to tell users about the api
 */
router.get('/', function (req, res) {
    res.render('API');
});

var dbRes;
var name;

router.use(basicAuth({authorizer: myAuthorizer,authorizeAsync:true, challenge: true, unauthorizedResponse: {"success": "false", "error": "Password or username invalid"}}));




/**
 * This allows you to create a user by passing it json, it has the same level of verification as via the form
 */
router.post('/users/create', function (req, res) {

    if (dbRes.role == "admin") {
        AuthController.checkIfUserExists(req.body.name.toLowerCase(), function (err, checkName) {
            if (checkName == null) {//user is a new username
                AuthController.createUser(req.body.name.toLowerCase(), req.body.pass, req.body.role, function (err, createUserResult) {
                    res.json({"Success": "true"})
                });
            } else {//user already exists
                res.json({"Success": "false", "Error": "User already exists"});
            }
        });
    } else {
        res.json({"Success": "false", "Error": "User account not authorised to make the change"})
    }
});

/**
 * This allows you to update the user, it has the same level of verification as the form
 */
router.post('/users/update', function (req, res) {

    if (dbRes.role == "admin") {//only admins should be able to change a users status
        UserManagementController.getUser(req.query.userName, function (err, user) {
            var dontRun = false;
            if (req.body.name != req.query.userName) {//update username
                if (req.body.name.includes(" ") || req.body.name == "") {
                    dontRun = true;
                    res.json({"Success": "false", "Error": "Username is already in use"})
                } else {
                    UserManagementController.updateUsername(user.id, req.body.name);
                }
            }
            if (req.body.Password != "") {//update password
                UserManagementController.updatePassword(user.id, req.body.pass);
            }
            if (req.body.role != res.role) {//update role
                UserManagementController.updateUserRole(user.id, req.body.role);
            }
            setTimeout(function () {
                if (!dontRun) {
                    res.json({"Success": "true"})
                }
            }, 1000);
        });
    } else {//else tell them they're not authorised
        res.json({"Success": "false", "Error": "User account not authorised to make the change"})
    }

});


/**
 * This gets a list of all the users and returns it as json
 */
router.get('/users/view', function (req, res) {

    if (dbRes.role == "admin") {//only admins should be able to change a users status
        UserManagementController.getUsers(function (err, res2) {
            if (err) throw err;
            var returnVal = [];
            for (var i = 0; i < res2.length; i++) {
                returnVal.push({"_id": res2[i]._id, "id": res2[i].id, "name": res2[i].name, "role": res2[i].role});
            }
            res.json(returnVal);
        });
    } else {//else tell them they're not authorised
        res.json({"Success": "false", "Error": "User account not authorised to make the change"})
    }


});


/**
 * This allows the user to pass in the json to create a new event
 */
router.post('/events/create', function (req, res) {

    if (dbRes.role != "pending") {
        EventController.checkName(req.body.Name, function (err, checkName) {
            if (checkName == null) {

                EventController.createEventFully(req.body.name, req.body.deadline, req.body.resources, req.body.viewUsersArray, req.body.updateUsersArray,
                    req.body.deleteUsersArray, req.body.location, req.body.description, req.body.viewRolesArray, req.body.editRolesArray, req.body.deleteRolesArray,
                    req.body.partsArray, req.query.name, function (err, insert) {
                        res.json({"Success": "true"})
                    });
            } else {
                res.json({"Success": "false", "Error": "Name is already in use"})
            }

        });
    } else {
        res.json({"Success": "false", "Error": "User account not authorised to make the change"})
    }

});

/**
 * This allows the user to update an event
 */
router.post('/events/update', function (req, res) {

    EventController.getEvent({"name": req.query.eventName}, function (err, event) {
        if (err) throw err;
        if (event != null && req.body.Name != "") {
            EventController.checkName(req.body.Name, function (err, nameResult) {
                if (res == null || req.body.name == req.query.eventName) {
                    EventController.deleteEvent(req.query.eventName);
                    event.eventName = req.body.name;
                    event.deadline = req.body.deadline;
                    event.resources = req.body.resources;
                    event.viewUsersArray = req.body.viewUsersArray;
                    event.updateUsersArray = req.body.updateUsersArray;
                    event.deleteUsersArray = req.body.deleteUsersArray;
                    event.locationOfEvent = req.body.location;
                    event.descriptionOfEvent = req.body.description;
                    event.viewRolesArray = req.body.viewRolesArray;
                    event.editRolesArray = req.body.editRolesArray;
                    event.deleteRolesArray = req.body.deleteRolesArray;
                    event.partsArray = req.body.partsArray;
                    event.saveEvent();
                    res.json({"Success": "true"})
                } else { //name already in use
                    res.json({"Success": "false", "Error": "Name is already in use"})
                }
            });
        } else { //could not get event
            res.json({"Success": "false", "Error": "Could not find the event"})
        }
    });

});

/**
 * this allows the user to delete an event
 */
router.post('/events/delete', function (req, res) {

    AuthController.checkRole(name.toLowerCase(), function (err, dbRes) {
        EventController.getEvent({"name": req.query.eventname}, function (err, event) {
            event.checkAuth(event, req.query.name, dbRes.role, function (err, intArray) {
                if (err) throw err;
                if (intArray.includes(3)) {
                    EventController.deleteEvent(req.query.eventname, function (err, deleted) {
                        res.json({"Success": "true"})
                    });
                } else {
                    res.json({"Success": "false", "Error": "User account not authorised to make the change"})
                }
            });
        });
    });

});

/**
 * this lets the user view all the events
 */
router.get('/events/view', function (req, res) {

    AuthController.checkRole(name, function (err, dbRes) {
        if (dbRes.role != "pending") {
            MongoController.findMultipleFromDB("WebProject", "Events", {}, function (err, result) {
                res.json(result);
            });
        } else {//else tell them they're not authorised
            res.json({"Success": "false", "Error": "User account not authorised to make the change"})
        }
    });

});


/**
 * This allows the user to create a new role
 */
router.post('/roles/create', function (req, res) {
    if (dbRes.role == "admin") {//only admins should be able to create or delete a role
        UserManagementController.checkIfRoleExists(req.body.RoleName.toLowerCase(), function (err, result) {
            if (result != null) {//if the role already exists
                res.json({"Success": "false", "Error": "The role already exists"})
            } else {
                UserManagementController.addRole(req.body.RoleName.toLowerCase(), function (err, r) {
                    res.json({"Success": "true"})
                });
            }
        });
    } else {//else tell them they're not authorised
        res.json({"Success": "false", "Error": "User account not authorised to make the change"})
    }


});

/**
 * This allows the user to update a role
 */
router.post('/roles/update', function (req, res) {

    if (dbRes.role == "admin") {//only admins should be able to change a users status
        if (req.body.Role.includes(" ") || req.body.Role == "") {
            res.json({"Success": "false", "Error": "User role provided is not a valid role"})
        } else {
            UserManagementController.updateRole(req.query.role, req.body.Role.toLowerCase(), function (err, updateResult) {
                if (err) throw err;
                res.json({"Success": "true"})
            });
        }
    } else {//else tell them they're not authorised
        res.json({"Success": "false", "Error": "User account not authorised to make the change"})
    }

});

router.post('/roles/delete', function (req, res) {

    if (dbRes.role == "admin") {//only admins should be able to create or delete a role
        UserManagementController.deleteRole(req.query.rolename, function (err, deleteResult) {
            if (deleteResult == null) {
                res.json({"Success": "false", "Error": "Could not find the role to delete"})
            } else {
                res.json({"Success": "true"})
            }
        });
    } else {//else tell them they're not authorised
        res.json({"Success": "false", "Error": "User account not authorised to make the change"})
    }


});

/**
 * This returns a list of all the roles
 */
router.get('/roles/view', function (req, res) {
    if (dbRes.role == "admin") {//only admins should be able to create or delete a role
        UserManagementController.getRoles(function (err, role) {
            res.json({"roles": role});

        });
    } else {//else tell them they're not authorised
        res.json({"Success": "false", "Error": "User account not authorised to make the change"})
    }

});



module.exports = router;

//https://www.npmjs.com/package/express-basic-auth
function myAuthorizer(username, password, callback) {
    if (username == null || password == null) {
        callback(null, false);
    } else {
        AuthController.checkPassword(username, password, function (err, result) {
            console.log(result);
            if (result) {//correct pass
                AuthController.checkRole(username, function (err, dbRes1) {
                    dbRes = dbRes1;
                    name = username;
                    callback(null, true);
                    return true;
                });
            } else {//failed pass or username
                callback(null, false);
            }
        });
    }
}