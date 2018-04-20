var eventClass = require('../Model/EventClass');
var MongoController = require('./MongoController');


module.exports = {
    /**
     * Creates a new event and saves it to the db
     * @param nameOfEvent Name of event
     * @param deadlineOfEvent Overaching deadline
     * @param resourcesRequiredForEvent Resources required
     * @param viewUsersArray Users with permission to view (overrides roles)
     * @param updateUsersArray  Users with permissions to update (overrides roles)
     * @param deleteUsersArray Users with permission to delete (overrides roles)
     * @param location Location of event
     * @param description Description
     * @param viewRolesArray Roles with permissions to view
     * @param editRolesArray Roles with permission to edit
     * @param deleteRolesArray Roles with permission to delete
     * @param creatorsName The creators name
     */
    createEvent: function createEvent(nameOfEvent, deadlineOfEvent, resourcesRequiredForEvent, viewUsersArray, updateUsersArray,
                                      deleteUsersArray, location, description, viewRolesArray, editRolesArray, deleteRolesArray
        , creatorsName, callback) {
        var event = new eventClass(nameOfEvent, deadlineOfEvent, resourcesRequiredForEvent, viewUsersArray, updateUsersArray, deleteUsersArray, location,
            description, viewRolesArray, editRolesArray, deleteRolesArray, null, creatorsName);
        event.saveEvent(callback);
    },
    /**
     * Used by the api to create an event with a populated parts array
     * @param nameOfEvent Name of event
     * @param deadlineOfEvent Overaching deadline
     * @param resourcesRequiredForEvent Resources required
     * @param viewUsersArray Users with permission to view (overrides roles)
     * @param updateUsersArray  Users with permissions to update (overrides roles)
     * @param deleteUsersArray Users with permission to delete (overrides roles)
     * @param location Location of event
     * @param description Description
     * @param viewRolesArray Roles with permissions to view
     * @param editRolesArray Roles with permission to edit
     * @param deleteRolesArray Roles with permission to delete
     * @param partsArray The parts array
     * @param creatorsName The creators name
     */
    createEventFully: function createEventFully(nameOfEvent, deadlineOfEvent, resourcesRequiredForEvent, viewUsersArray, updateUsersArray,
                                                deleteUsersArray, location, description, viewRolesArray, editRolesArray, deleteRolesArray,
                                                partsArray, creatorsName, callback) {
        var event = new eventClass(nameOfEvent, deadlineOfEvent, resourcesRequiredForEvent, viewUsersArray, updateUsersArray, deleteUsersArray, location,
            description, viewRolesArray, editRolesArray, deleteRolesArray, partsArray, creatorsName);
        event.saveEvent(callback);
    },
    /**
     * returns a loaded event instance
     * @param searchParam The event to search for
     * @param callback Run after the loading
     */
    getEvent: function getEvent(searchParam, callback) {
        var event = new eventClass();
        event.loadEvent(event, searchParam, callback);
    },
    /**
     * this checks the name against the db
     * @param searchParam The name to search for
     * @param callback Run at end of the statement
     */
    checkName: function checkName(searchParam, callback) {
        checkNameDB(searchParam, callback);
    },
    /**
     * This deletes an event from the db
     * @param searchParam the name to search for
     * @param callback Run after the delete is finsihed
     */
    deleteEvent: function deleteEvent(searchParam, callback) {
        deleteEventFRomDB(searchParam, callback)
    },
    /**
     * gets all the events the user has created
     * @param searchParam name of user
     * @param callback Ran after mongodb selection
     */
    getCreatedEvents: function getCreatedEvents(searchParam, callback) {
        getCreatedEventsFromDB({"creatorName": searchParam}, callback);
    },
    /**
     * Gets all events the user has update permissions on
     * @param name the name of the user
     * @param The role of the user
     * @param callback Ran after the function is done
     */
    getEventsWithEditPermissions: function getEventsWithEditPermissions(name, role, callback) {
        getEventsWithUpdateFromDB(name, role, callback);
    },
    /**
     * Add a part to the event
     * @param part The part to add
     * @param callback Run after the insertion
     */
    addPart: function addPart(part, callback) {
        addPartToEvent(part, callback);
    },
    /**
     * iterates through events looking for the partname matching the one already mentioned
     * @param events The events the user has access too
     * @param partName The partname to search for
     * @param callback Run after everything is finished
     */
    searchForPart: function searchForPart(events, partName, callback) {
        var iteriations = 0;
        var called = false;
        events.forEach(function (event) {
            event.partsArray.forEach(function (part) {
                if (part.name == partName) {
                    if (!called) {
                        called = true;
                        callback(null, part);
                    }
                }
            });
            iteriations += 1;
            if (iteriations == events.length && !called) {
                callback(null, null);
                called = true;
            }
        });
    },
    /**
     * this searches for a part based on name
     * @param name Name of the part
     * @param callback run after the check
     */
    getPart: function getPart(name, callback) {
        var called = false;
        var i = 0;
        getEventsFromDB(name, function (err, res) {
            res.forEach(function (event) {
                event.partsArray.forEach(function (part) {
                    console.log(part.name + "  " + name);
                    if (part.name == name && !called) {
                        called = true;
                        callback(null, part, event);
                    }
                });
                i += 1;
                console.log (i + "     " + res.length);
                if (i == res.length && !called) {
                    called = true;
                    callback(null, null);
                }
            });

        });
    },

};

function getEventsFromDB(name, callback) {
    MongoController.findMultipleFromDB("WebProject", "Events", {}, callback)
}

/**
 * Adds a part to the specified event
 * @param part Part to add
 * @param callback Callback run after the event is saved
 */
function addPartToEvent(part, callback) {
    var event = new eventClass();
    event.loadEvent(event, {"name": part.partOf}, function (err, event) {
        if (event.partsArray == null) {
            event.partsArray = [];
        }
        event.partsArray.push(part);
        deleteEventFRomDB(event.eventName, function (err, res) {
            event.saveEvent(callback);
        });

    });
}

/**
 * gets all the events the user has update permissions on
 * @param name The name of the user
 * @param role The role of the user
 * @param callback Run after they find all the events
 */
function getEventsWithUpdateFromDB(name, role, callback) {
    MongoController.findMultipleFromDB("WebProject", "Events", {}, function (err, res) {
        var validEventArray = [];
        var numOfLoops = 0;
        res.forEach(function (singularEvent) {
            eventClass.prototype.loadEvent(singularEvent, {"name": singularEvent.name}, function (err, event) {
                eventClass.prototype.checkAuth(event, name, role, function (err, intarray) {
                    if (intarray.includes(2)) {
                        validEventArray.push(event);
                    }
                    numOfLoops += 1;
                    if (numOfLoops == res.length) {
                        returnEventArray(validEventArray, callback);
                    }
                });
            });
        });
    });
}

/**
 * This is used in the foreach loop to act as an async return
 * @param validEventArray An array of all valid events
 * @param callback Run immediately
 */
function returnEventArray(validEventArray, callback) {
    callback(null, validEventArray);
}

/**
 * gets all the events the user has created
 * @param searchParam name of user
 * @param callback Ran after mongodb selection
 */
function getCreatedEventsFromDB(searchParam, callback) {
    MongoController.findMultipleFromDB("WebProject", "Events", searchParam, callback);
}

/**
 * this checks the name against the db
 * @param searchParam The name to search for
 * @param callback Run at end of the statement
 */
function checkNameDB(searchParam, callback) {
    MongoController.findFromDB("WebProject", "Events", {"name": searchParam}, callback);
}

/**
 * deletes the specified event from the db
 * @param searchParam The name to search for
 * @param callback Run at end of the statement
 */
function deleteEventFRomDB(searchParam, callback) {
    console.log(searchParam);
    MongoController.deleteRecordsFromDb("WebProject", "Events", {"name": searchParam}, false, callback);
}