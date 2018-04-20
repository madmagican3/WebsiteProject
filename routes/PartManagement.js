var express = require('express');
var router = express.Router();
var AuthController = require('../Controller/AuthController');
var EventController = require('../Controller/EventController');
var UserManagementController = require('../Controller/UserManagementController');
var partClass = require('../Model/PartsClass');


var empty = false;
var invalidName = false;
var inUse = false;
var userName;
var name;

router.use(function (req, res, next) {
    var cookie = req.signedCookies['ID'];

    AuthController.checkAuth(res, req, function (authed, name1) {
        if (authed) {
            AuthController.getUser({"name": name1}, function (err, user) {
                userName = user;
                name = name1;
                next();
            });
        } else {
            if (cookie != null) {
                res.cookie("ID", cookie, {expires: new Date(1), httponly: true, signed: true});
            }
            res.redirect('../login');
        }
    });
})

/**
 * This allows new parts to be created
 */
/* GET home page. */
router.get('/', function (req, res, next) {

    EventController.getEventsWithEditPermissions(name, userName.role, function (err, events) {
        UserManagementController.getUsers(function (err, users) {
            if (events != null && users != null) {
                res.render('new_part', {
                    "events": events,
                    "users": users,
                    "inUse": inUse,
                    "invalid": invalidName,
                    "empty": empty
                })
                empty = false;
                invalidName = false;
                inUse = false;
            } else {
                res.render('not_authed');
            }
        });
    });

});
/**
 * Creates a new part
 */
router.post('/', function (req, res, next) {
    if (req.body.Name == "" || req.body.Deadline == "" || req.body.starttime == "" || req.body.location == "" ||
        req.body.status == "" || req.body.assignedTo == "" || req.body.description == "" || req.body.partOf == "") {
        empty = true;
        res.redirect('part');
    } else if (req.body.Name.includes(" ")) {
        invalidName = true;
        res.redirect('part');
    }
    else {
        var part = new partClass(req.body.Name, req.body.Deadline, req.body.starttime, req.body.location, req.body.status,
            req.body.assignedTo, req.body.description, req.body.partOf);
        console.log(part);
        EventController.getPart(req.body.Name, function (err, result) {
            if (result == null) {
                EventController.addPart(part, function (err, result, event) {
                    res.redirect('eventmanagement/update/' + req.body.partOf);
                });
            } else {
                inUse = true;
                res.redirect('part');
            }
        })
    }

});
var editEmpty = false;
var error = false;
/**
 * This will allow editing of parts
 */
router.get('/update/:name', function (req, mainRes, next) {

    EventController.getEventsWithEditPermissions(name, userName.role, function (err, events) {
        UserManagementController.getUsers(function (err, users) {
            EventController.searchForPart(events, req.params.name, function (err, part, event) {
                console.log(part.description);
                if (events != null && users != null && part != null) {
                    mainRes.render('edit_part', {
                        "events": event,
                        "users": users,
                        "part": part,
                        "empty": editEmpty,
                        "err": error,
                        "description":part.description
                    })
                    editEmpty = false;
                    error = false;
                } else if (events == null || users == null || part == null) {
                    mainRes.render('not_authed');
                }
            });

        });
    });
});
/**
 * Edits a part
 */
router.post('/update/:name', function (req, mainRes, next) {
    if (req.body.check != null && req.body.check == "true") {
        EventController.getPart(req.params.name, function (err, result) {
            console.log(result);
            if (result != null) {
                EventController.getEvent({"name": result.partOf}, function (err, res) {
                    var iteriations = 0;
                    var called = false;
                    res.partsArray.forEach(function (part) {
                        if (part.name == result.name && !called) {
                            called = true;
                            res.partsArray.splice(res.partsArray.indexOf(result), 1);
                            EventController.deleteEvent(part.partOf);
                            res.saveEvent(function (err, res) {
                                console.log("got here");
                                console.log(part.partOf);
                                mainRes.redirect('./eventmanagement/update/' + part.partOf);
                            });
                        } else if (iteriations == res.partsArray.length) {

                            error = true;
                            mainRes.redirect('/part/update/' + req.params.name);
                        }
                        iteriations += 1;

                    });

                });
            } else {
                error = true;
                mainRes.redirect('/part/update/' + req.params.name);
            }
        });
    } else {
        if (req.body.deadline == "" || req.body.starttime == "" || req.body.location == "" ||
            req.body.status == "" || req.body.assignedTo == "" || req.body.description == "") {
            editEmpty = true;
            mainRes.redirect('/part/update/' + req.params.name);
        } else {
            EventController.getPart(req.params.name, function (err, result) {

                var newPart = new partClass(result.name, req.body.deadline, req.body.starttime, req.body.location, req.body.status,
                    req.body.assignedTo, req.body.description, result.partOf);
                if (result != null) {
                    EventController.getEvent({"name": result.partOf}, function (err, res) {
                        console.log(res);
                        var iteriations = 0;
                        var called = false;
                        console.log("going into the loop");
                        console.log(res.partsArray);
                        res.partsArray.forEach(function (part) {
                            console.log("Loop");
                            if (part.name == result.name && !called) {
                                called = true;
                                res.partsArray.splice(res.partsArray.indexOf(result), 1);
                                EventController.deleteEvent(part.partOf);
                                res.partsArray.push(newPart);
                                res.saveEvent(function (err, res) {
                                    mainRes.redirect('/eventmanagement/update/' + part.partOf);
                                });
                            } else if (iteriations == res.partsArray.length) {

                                error = true;
                                mainRes.redirect('/part/update/' + req.params.name);
                            }
                            iteriations += 1;

                        });

                    });
                } else {
                    error = true;
                    mainRes.redirect('/part/update/' + req.params.name);
                }
            });
        }
    }
});

module.exports = router;
