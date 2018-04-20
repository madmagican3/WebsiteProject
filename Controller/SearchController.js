var eventClass = require('../Model/EventClass');
var eventController = require('./EventController');
var AuthController = require('./AuthController');


module.exports = {
    search: function search(searchParam, username, callback) {
        var eventList = [];
        var iteriation = 0;
        AuthController.getUser({"name": username}, function (err, user) {
            eventController.getEventsWithEditPermissions(username, user.role, function (err, res) {
                res.forEach(function (event) {
                    //http://blog.liveedu.tv/javascript-string-check/
                    eventClass.prototype.loadEvent(event, {"name": event.name}, function (err, event) {
                        if (event.name.indexOf(searchParam) > -1 || event.resources.indexOf(searchParam) > -1 || event.location.indexOf(searchParam) > -1 ||
                            event.description.indexOf(searchParam) > -1) {
                            eventList.push(event);
                        } else {
                            event.partsArray.forEach(function (part) {
                                var partsIteriation = 0;
                                if (part.name.indexOf(searchParam) > -1 || part.location.indexOf(searchParam) > -1 || part.status.indexOf(searchParam) > -1 ||
                                    part.assigned.indexOf(searchParam) > -1 || part.description.indexOf(searchParam) > -1) {
                                    eventList.push(event);
                                }
                                partsIteriation += 1;
                                if (iteriation == res.length && partsIteriation == event.partsArray.length) {
                                    callback(null, eventList);
                                }

                            });
                        }
                        iteriation += 1;
                        if(iteriation==res.length) {
                            callback(null, eventList);
                        }
                    });
                });
            });
        });
        // AuthController.getUser({"name": username}, function (err, user) {
        //     eventController.getEventsWithEditPermissions(username, user.role, function (err, res) {
        //         res.forEach(function (event) {
        //             //http://blog.liveedu.tv/javascript-string-check/
        //             eventClass.prototype.loadEvent(event, {"name": event.name}, function (err, event) {
        //                 if (event.name.indexOf(searchParam) > -1 || event.resources.indexOf(searchParam) > -1 || event.location.indexOf(searchParam) > -1 ||
        //                     event.description.indexOf(searchParam) > -1) {
        //                     eventList.push(event);
        //                 } else {
        //                     event.partsArray.forEach(function (part) {
        //                         var partsIteriation = 0;
        //                         if (part.name.indexOf(searchParam) > -1 || part.location.indexOf(searchParam) > -1 || part.status.indexOf(searchParam) > -1 ||
        //                             part.assigned.indexOf(searchParam) > -1 || part.description.indexOf(searchParam) > -1) {
        //                             eventList.push(event);
        //                         }
        //                         partsIteriation += 1;
        //                         if (iteriation == res.length && partsIteriation == event.partsArray.length) {
        //                             console.log("The final thing is getting called");
        //                             callback(null, eventList);
        //                         }
        //
        //                     });
        //                     if (iteriation == res.length && event.partsArray.length == null) {
        //                         console.log("The final thing is getting called");
        //                         callback(null, eventList);
        //                     }
        //                 }
        //                 iteriation += 1;
        //
        //             });
        //
        //         });
        //     });
        // });

        //first filter on if they have edit permissions
        //Then check every valid field .contains the val, if it does pass it on
    }
};