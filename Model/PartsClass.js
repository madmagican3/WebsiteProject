var MongoContoller = require('../Controller/MongoController');

/**
 * A part of an event
 * @param name Name of part
 * @param deadline deadline of this part
 * @param startTime Start time of this part
 * @param location location of this part
 * @param status Status of this part
 * @param assigned Who this is assigned too
 * @param description Description of the event
 * @constructor
 */
function Part(name, deadline, startTime, location, status, assigned, description, partOf) {
    this.name = name;
    this.deadline = deadline;
    this.startTime = startTime;
    this.location = location;
    this.status = status;
    this.assigned = assigned;
    this.description = description;
    this.partOf = partOf;
}

// Event.prototype.checkAuth  = function (event, name, role,callback) {
//
// }


module.exports = Part;