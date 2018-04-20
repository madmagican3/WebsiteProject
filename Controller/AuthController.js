var bcrypt = require('bcrypt');
var AuthModel = require('../Model/AuthControllerModel')


module.exports = {
    /**
     * This will check to see if the cookie is still valid
     * @param res1 the original result which lets us set the cookie
     * @param req Original request which lets us get the signed cookie
     * @param callback Callback run at end
     */
    checkAuth: function checkAuth(res1, req, callback) {
        //https://stackoverflow.com/questions/11897965/what-are-signed-cookies-in-connect-expressjs
        var hash = req.signedCookies['ID'];
        AuthModel.findHash({"uuid": hash}, function (err, res) {
            if (err) throw err;
            if (res == null) { //if this cookie isnt in the database
                callback(false, "");
                return;
            }
            var expirationTime = res.expiration;
            if ((1800000 + expirationTime) < Date.now()) { //if this cookie is expired
                callback(false, "");
            } else { //if the cookie isnt expired and exists
                res1.cookie("ID", hash, {expires: new Date(Date.now() + 1800000), httponly: true, signed: true})
                AuthModel.extendCookieInDb(hash);
                callback(true, res.user);
            }
        });
    },
    /**
     * clears out the expired cookies
     */
    clearCookies: function clearCookies() {
        AuthModel.clearOutExpiredCookies();
    },
    /**
     * this is used to create the user, it will return a false if the user is already used
     * @param name This is the name the user should be created under
     * @param pass this is the non hashed password the user should use
     * @param role This is the role of the user
     */
    createUser: function createUser(name, pass, role, callback) {

        AuthModel.addUserToDb(name, pass, role, function (err, res) {
            if (err) throw err;
            callback(err, res);
        });
    },
    /**
     * This will check the pass via the user
     * @param user This is the user it will check the pass against
     * @param pass This is the non-hashed password we'll check
     * @returns True if the password matches, false if user not found or not valid password
     */
    checkPassword: function checkPassword(user, pass, callback) {
        AuthModel.getPasswordForUser(user, function (err, res) {
            if (res == null) {
                callback(err, false);
                return;
            }
            //https://www.npmjs.com/package/bcrypt
            var result = bcrypt.compareSync(pass, res.pass);
            callback(err, result);
        });
    },
    /**
     /**
     * This will add a cookie to the db for later verification, it's hashed for security purposes
     * @param user the username
     * @param callback the function passed in from login
     */
    addCookie: function addCookie(user, callback) {
        AuthModel.addCookieToDb(user, callback);
    },
    /**
     * This will see if a user exists
     * @param user the user to search for
     * @param callback the callback
     */
    checkIfUserExists: function checkIfUserExists(user, callback) {
        AuthModel.searchForUser(user, callback);
    },
    /**
     * This will get the role for a user
     * @param user Username to search for
     * @param callback Callback
     */
    checkRole: function checkRole(user, callback) {
        AuthModel.checkRoleInDb(user, callback);
    },
    /**
     * This deletes the specified cookie from the db
     * @param uuid The cookie to search for
     */
    deleteCookie: function deleteCookie(uuid) {
        AuthModel.deleteCookie(uuid);
    },
    /**
     * This gets any records that include the role specified
     * @param role The role to search for
     * @param callback Run at the end of the mongodb statement
     */
    checkIfUsersHaveRole: function checkIfUsersHaveRole(role, callback) {
        AuthModel.checkIfUsersHaveRole(role, callback);
    },
    /**
     * Gets the user
     * @param user search param
     * @param callback Run after the data is fetched from db
     */
    getUser: function getUser(user, callback) {
        AuthModel.getUser(user, callback);
    }
};
