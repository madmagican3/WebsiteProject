var model = require("../Model/UserManagementControllerModel");
var AuthController = require("./AuthController");

module.exports = {
    /**
     * Gets all the users on the system
     * @param callback Run at the end of grabbing all the data
     */
    getUsers: function getUsers(callback) {
        model.getUsers(callback);
    },
    /**
     * Get the specified user
     * @param callback Run at the end of grabbing all the data
     */
    getUser: function getUser(name, callback) {
        model.getUser(name, callback);
    },
    /**
     * This will get all the roles
     * @param callback This will be run at the end
     */
    getRoles: function getRoles(callback) {
        model.getRoles(callback);
    },
    /**
     * This will update the username to the new value
     * @param id The id of the user we want to change
     * @param newUsername The name we want to change it too
     */
    updateUsername: function updateUsername(id, newUsername) {
        AuthController.checkIfUserExists(newUsername.toLowerCase(), function (err, res) {
            if (res == null) {//user is a new username
                model.updateUsername(id, newUsername);
            }
        });
    },
    /**
     * Updates the password for the specified user account
     * @param id The id of the user you want to change
     * @param newPassword the plaintext of the new password you wont change
     */
    updatePassword: function updatePassword(id, newPassword) {
        model.updatePassword(id, newPassword)
    },
    /**
     * This updates the role for the specified user account
     * It also updates all users using that role
     * @param id The id of the user you want to change
     * @param newRole The role you want to change the user too
     */
    updateUserRole: function updateUserRole(id, newRole) {
        model.updateUserRole(id, newRole)
    },
    /**
     * This will create a new role
     * @param name The name of the new role
     * @param callback Run after the mongodb insertion
     */
    addRole: function addRole(name, callback) {
        model.addRole(name, callback);
    },
    /**
     * Check if the specified role based on name exists
     * @param name The name to check for
     * @param callback The callback run after the mongodb insertion
     */
    checkIfRoleExists: function checkRole(name, callback) {
        model.checkRole(name, callback);
    },
    /**
     * delete the specified role
     * @param name The role to search for
     * @param callback The code run after the delete
     */
    deleteRole: function deleteRole(name, callback) {
        AuthController.checkIfUsersHaveRole(name, function (err, res) {
            if (err) throw err;
            if (res != null) {
                callback(err, null);
            } else {
                model.deleteRole(name, callback);
            }
        });
    },
    /**
     * Updates a role to be the specific new role, also edits all users using the role
     * @param roleToEdit role search param
     * @param roleToEditTo New role name
     * @param callback Run at end of update
     */
    updateRole: function updateRole(roleToEdit, roleToEditTo, callback) {
        model.updateRole(roleToEdit, roleToEditTo, callback);
    },
    /***
     * this deletes the specified user from the db
     * @param user The user to delete
     * @param callback callback to run
     */
    deleteUser : function deleteUser (user, callback){
        model.deleteUser(user,callback);
    }
}