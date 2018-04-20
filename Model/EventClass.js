var MongoContoller = require('../Controller/MongoController');

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
 * @constructor Initializes all the required variables
 */
function Event(nameOfEvent, deadlineOfEvent, resourcesRequiredForEvent, viewUsersArray, updateUsersArray,
               deleteUsersArray, location, description, viewRolesArray, editRolesArray, deleteRolesArray, partsArray
    , creatorsName) {
    this.eventName = nameOfEvent;
    this.deadline = deadlineOfEvent;
    this.resources = resourcesRequiredForEvent;
    this.viewUsersArray = viewUsersArray;
    if (this.viewUsersArray == null)
        this.viewUsersArray = []
    this.updateUsersArray = updateUsersArray;
    if (this.updateUsersArray == null)
        this.updateUsersArray = []
    this.deleteUsersArray = deleteUsersArray;
    if (this.deleteUsersArray == null)
        this.deleteUsersArray = []
    this.locationOfEvent = location;
    this.descriptionOfEvent = description;
    this.viewRolesArray = viewRolesArray;
    if (this.viewRolesArray == null)
        this.viewRolesArray = []
    this.editRolesArray = editRolesArray;
    if (this.editRolesArray == null)
        this.editRolesArray = [];
    this.deleteRolesArray = deleteRolesArray;
    if (this.deleteRolesArray == null)
        this.deleteRolesArray = []
    this.creatorsName = creatorsName;
    this.partsArray = partsArray;
    if (this.partsArray == null)
        this.partsArray = [];

}


//https://dzone.com/articles/how-to-create-instantiate-a-class-in-nodejs
/**
 * checcks if the user is allowed to do the specified aciont
 * 1 is view, 2 is update, 3 is delete
 * @param name name of user
 * @param role role of user
 * @param callback run at end of check
 */
Event.prototype.checkAuth = function (event, name, role, callback) {
    if (name == event.creatorsName){
        callback(null, [1,2,3]);
        return;
    }
    var intArray = [];
    if (event.viewUsersArray != null || event.viewRolesArray != null) {
        if (event.viewUsersArray.includes(name) || event.viewRolesArray.includes(role)) {
            intArray.push(1)
        }
    }

    if (event.updateUsersArray != null || event.editRolesArray != null) {
        if (event.updateUsersArray.includes(name) || event.editRolesArray.includes(role)) {
            intArray.push(2);
        }
    }
    if (event.deleteUsersArray != null || event.deleteRolesArray != null) {
        if (event.deleteUsersArray.includes(name) || event.deleteRolesArray.includes(role)) {
            intArray.push(3)
        }
    }

    callback(null, intArray);
}
/**
 * This saves the event into the db
 * @param callback run after insertion
 */
Event.prototype.saveEvent = function (callback) {
    MongoContoller.insertIntoDB("WebProject", "Events", {
        "name": this.eventName,
        "deadline": this.deadline,
        "resources": this.resources,
        "viewUsersArray": this.viewUsersArray,
        "updateUsersArray": this.updateUsersArray,
        "deleteUsersArray": this.deleteUsersArray,
        "location": this.locationOfEvent,
        "description": this.descriptionOfEvent,
        "viewRolesArray": this.viewRolesArray,
        "editRolesArray": this.editRolesArray,
        "deleteRolesArray": this.deleteRolesArray,
        "partsArray": this.partsArray,
        "creatorName": this.creatorsName
    }, callback);
}
/**
 * This will load an event from the db based on the search param
 * @param searchParam The event name
 * @param callback Run after loading
 */
Event.prototype.loadEvent = function (event, searchParam, callback) {
    MongoContoller.findFromDB("WebProject", "Events", searchParam, function (err, res) {
        if (err) throw err;
        if (res == null) {
            callback(err, null);
            return;
        }
        event.eventName = res.name;
        event.deadline = res.deadline;
        event.resources = res.resources;
        event.viewUsersArray = res.viewUsersArray;
        event.updateUsersArray = res.updateUsersArray;
        event.deleteUsersArray = res.deleteUsersArray;
        event.locationOfEvent = res.location;
        event.descriptionOfEvent = res.description;
        event.viewRolesArray = res.viewRolesArray;
        event.editRolesArray = res.editRolesArray;
        event.deleteRolesArray = res.deleteRolesArray;
        event.creatorsName = res.creatorName;
        event.partsArray = res.partsArray;
        callback(err, event);
    });
}


module.exports = Event;