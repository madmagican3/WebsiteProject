var bcrypt = require('bcrypt');
const saltRounds = 10;
//https://stackoverflow.com/questions/6998355/including-javascript-class-definition-from-another-file-in-node-js
var MongoController  = require("../Controller/MongoController");
module.exports = {
    /**
     *checks the role in the db
     * @param user user to search for
     * @param callback callback ran at end
     */
    checkRoleInDb : function checkRoleInDb(user,callback){
        MongoController.findFromDB("WebProject", "Users", {"name":user}, callback)
    },

/**
 * this searches to see if a user exists
 * @param user username to search for
 * @param callback what to run afterwards
 */
    searchForUser : function searchForUser(user, callback){
        MongoController.findFromDB("WebProject", "Users", {"name": user}, callback);
    },

/**
 * This will add a cookie to the db for later verification, it's hashed for security purposes
 * @param user the username
 * @param callback This is run at the end
 */
    addCookieToDb : function addCookieToDb(user, callback){
        bcrypt.hash(user, saltRounds, function (err, res) {
            if (err) throw err;
            MongoController.insertIntoDB("WebProject","Cookie", {"uuid" : res, "user": user.toLowerCase(), "expiration": Date.now()+1800000}, function (err) {
                if (err) throw err;
                callback(err, res);
            });
        });
    },

/**
 * This is the actual connection to get the password
 * @param user This is the user we're going to check
 * @returns {*|void} This returns nothing if the user cannot be found
 */
    getPasswordForUser : function getPasswordForUser(user, callback){
        MongoController.findFromDB("WebProject","Users", {"name": user.toLowerCase() }, callback);
    },

/**
 * Add a user to the database matching all the vals and using the next ID
 * @param name name of user
 * @param pass Pass of user (non hashed)
 * @param role role of user
 * @param callback Run at the end of the insert intodb
 */
    addUserToDb : function addUserToDb(name,pass,role, callback){
        MongoController.findFromDB("WebProject", "Users", {"name": name}, function (err,res){
            if (res == null){
                autoIncrementID(function (err,res){
                    if (err) throw err;
                    //counter val is the id of the user
                    MongoController.insertIntoDB("WebProject","Users", {"id" : res.CounterVal, "name": name.toLowerCase() ,"pass" :
                            bcrypt.hashSync(pass,saltRounds),"role" :  role  }, callback);
                });
            }else {
                console.log("This user is already in use");
            }
        });
    },
    /**
     * This fetches a user from the db
     * @param name Search paramater
     * @param callback Ran after mongodb get
     */
    getUser : function getUser(name, callback){
        MongoController.findFromDB("WebProject", "Users", name, callback);
    },



/**
 * This will find the cookie hash in the db
 * @param SearchVal The value you're searching for
 * @param callback2 the callback you want to run
 */
    findHash : function findHash(SearchVal,callback2){
        MongoController.findFromDB("WebProject", "Cookie", SearchVal, function (err,res){
            if (err) throw err;
            callback2(err,res);
        });
    },

/**
 * Clears all expired cookies in db
 */
    clearOutExpiredCookies : function clearOutExpiredCookies(){
        MongoController.deleteExpiredCookiesFromDb();
    },

/**
 * Extends specified cookie in db
 * @param uuid The cookie to search for
 */
    extendCookieInDb : function extendCookieInDb(uuid){
        MongoController.extendCookieInDb(uuid);
    },
    /**
     * Deletes specified cookie from db
     * @param uuid The cookie to search for
     */
    deleteCookie : function deleteCookie(uuid){
        MongoController.deleteCookieFromDb(uuid);
    },
    checkIfUsersHaveRole : function checkIfUsersHaveRole (role,callback){
        MongoController.findFromDB("WebProject", "Users", {"role": role}, callback);
    }

};
/**
 * Gets the next ID num for users then increments it in the db
 * @param callback run after updating the id
 */
 function autoIncrementID(callback){
    MongoController.findFromDB("WebProject", "Counter", {}, function (err, res){
        if (err) throw err;
        if (res == null){
            MongoController.insertIntoDB("WebProject", "Counter", {"CounterVal" : 1 }, callback(err,res))
        }else {
            MongoController.replaceOneInDb("WebProject", "Counter",{"CounterVal" : res.CounterVal},{"CounterVal" : res.CounterVal +1 }, callback(err,res));
        }
    });
}