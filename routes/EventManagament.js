var express = require('express');
var router = express.Router();
var AuthController = require('../Controller/AuthController');
var UserController = require('../Controller/UserManagementController');
var EventController = require('../Controller/EventController');
var SearchController = require('../Controller/SearchController');

/**
 * If the users cookie is valid this extends the cookie and then renders the page
 * If it's not valid it deletes the cookie and then renders the login page
 */
/* GET home page. */
router.get('/create', function (req, res, next) {
    var cookie = req.signedCookies['ID'];

    AuthController.checkAuth(res, req, function (authed, name) {
        if (authed) {//if the user is logged in
            AuthController.checkRole(name.toLowerCase(), function (err, dbRes) {
                if (dbRes.role != "pending") {
                    UserController.getUsers(function (err, results) {
                        UserController.getRoles(function (err, secondResults) {
                            res.render('new_event', {
                                "Users": results,
                                "Roles": secondResults,
                                "used": newUsed,
                                "invalid": newInvalid
                            });
                            newInvalid = false;
                            newUsed = false;
                        });
                    });
                } else {//else tell them they're not authorised
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
});

/**
 * Displays the search page
 */
router.get('/search', function (req, res, next) {
    var cookie = req.signedCookies['ID'];

    AuthController.checkAuth(res, req, function (authed, name) {
        if (authed) {
            res.render('search_events');
        } else {
            if (cookie != null) {
                res.cookie("ID", cookie, {expires: new Date(1), httponly: true, signed: true});
            }
            res.redirect('../login');
        }
    });
});

/**
 * used to search via post
 */
router.post('/search', function (req, mainres, next) {
    var cookie = req.signedCookies['ID'];

    AuthController.checkAuth(mainres, req, function (authed, name) {
        if (authed) {
            SearchController.search(req.body.searchVal, name, function (err, res) {
                mainres.render('search_results', {"results": res});
            });
        } else {
            if (cookie != null) {
                mainres.cookie("ID", cookie, {expires: new Date(1), httponly: true, signed: true});
            }
            mainres.redirect('../login');
        }
    });
});
/**
 * used to submit a new event
 */

var newInvalid = false;
var newUsed = false;

router.post('/create', function (req, mainRes, next) {
    if (req.body.Name.includes(" ") || req.body.Name == "" || req.body.Deadline == "" || req.body.Resources == "" || req.body.location == "" ||
        req.body.description == "") { // required fields are invalid
        newInvalid = true;
        mainRes.redirect('/eventmanagement/create')
    } else {
        var cookie = req.signedCookies['ID'];

        AuthController.checkAuth(mainRes, req, function (authed, name) {
            if (authed) {
                EventController.checkName(req.body.Name, function (err, res) {
                    if (res == null) {
                        EventController.createEvent(req.body.Name, req.body.Deadline, req.body.Resources, req.body.ViewUsers, req.body.UpdateUsers, req.body.DeleteUsers, req.body.location,
                            req.body.description, req.body.ViewRoles, req.body.EditRoles, req.body.DeleteRoles, name, function (err, res) {
                                mainRes.redirect('/eventmanagement/update/' + req.body.Name);
                            });
                    } else {
                        newUsed = true;
                        mainRes.redirect('/eventmanagement/create')
                    }

                });
            } else {
                if (cookie != null) {
                    mainRes.cookie("ID", cookie, {expires: new Date(1), httponly: true, signed: true});
                }
                mainRes.redirect('../login');
            }
        });
    }

});
/**
 * This is used to update a project
 */
router.get('/update/:name', function (req, res, next) {
    var cookie = req.signedCookies['ID'];

    AuthController.checkAuth(res, req, function (authed, name) {
        if (authed) {
            AuthController.getUser({"name": name.toLowerCase()}, function (err, user) {
                if (err) throw err;
                EventController.getEvent({"name": req.params.name}, function (err, event) {
                    if (err) throw err;
                    if (event == null) {
                        res.redirect('../../');
                        return;
                    }

                    event.checkAuth(event, name, user.role, function (err, intArray) {
                        if (err) throw err;
                        var options = {};
                        if (intArray.includes(3)) {
                            options = {
                                "view": true,
                                "update": true,
                                "deleteEvent": true,
                                "event": event,
                                "invalid": invalidParams,
                                "nameUsed": nameInUse,
                                "error": error
                            };
                        } else if (intArray.includes(2)) {
                            options = {
                                "view": true,
                                "update": true,
                                "event": event,
                                "invalid": invalidParams,
                                "nameUsed": nameInUse,
                                "error": error
                            };
                        } else if (intArray.includes(1)) {
                            options = {"view": true, "event": event};
                        }
                        if (options.isNullOrUndefined) {
                            res.redirect('not_authed');
                        }
                        invalidParams = false;
                        nameInUse = false;
                        error = false;
                        res.render('event', options);
                    });
                });
            })
        } else {
            if (cookie != null) {
                res.cookie("ID", cookie, {expires: new Date(1), httponly: true, signed: true});
            }
            res.redirect('../../login');
        }

    });
});
var invalidParams = false;
var nameInUse = false;
var error = false;

/**
 * This should delete and update the projects depending on which button was pressed
 */
router.post('/update/:name', function (req, mainRes, next) {
        if (req.body.check != null && req.body.check == "true") { //if the delete button was pressed
            EventController.deleteEvent(req.params.name, function (err, res) {
                mainRes.redirect('../../eventmanagement');
            });
        }else {
            if (req.body.Name == "" || req.body.Name.includes(" ")) { //invalid params
                invalidParams = true;
                mainRes.redirect('/eventmanagement/update/' + req.params.name)
            }else { // if the update button is pressed
                EventController.getEvent({"name": req.params.name}, function (err, event) {
                    if (err) throw err;
                    if (event != null && req.body.Name != "") {
                        EventController.checkName(req.body.Name, function (err, res) {
                            if (res == null || res.body.Name == req.params.name) {
                                EventController.deleteEvent(req.params.name);
                                event.eventName = req.body.Name;
                                event.deadline = req.body.Deadline;
                                event.resources = req.body.Resources;
                                event.locationOfEvent = req.body.location;
                                event.descriptionOfEvent = req.body.description;
                                event.saveEvent();
                                mainRes.redirect('../../eventmanagement');
                            } else { //name already in use
                                nameInUse = true;
                                mainRes.redirect('/eventmanagement/update/' + req.params.name)
                            }
                        });
                    } else { //could not get event
                        error = true;
                        mainRes.redirect('/eventmanagement/update/' + req.params.name)
                    }
                });
            }

        }

});

/**
 * Shows all assigned events to the user
 */
router.get('/', function (req, res, next) {
    var cookie = req.signedCookies['ID'];

    AuthController.checkAuth(res, req, function (authed, name) {
        AuthController.checkRole(name, function (err, roleRes) {
            if (authed && roleRes != "pending") {
                EventController.getCreatedEvents(name, function (err, event) {
                    res.render('event_management', {"events": event});
                });
            } else {
                if (cookie != null) {
                    res.cookie("ID", cookie, {expires: new Date(1), httponly: true, signed: true});
                }
                res.redirect('../login');
            }
        });
    });
});


module.exports = router;
