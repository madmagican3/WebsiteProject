var MongoController = require("../Controller/MongoController");
var bcrypt = require('bcrypt');
const saltRounds = 10;


module.exports = {
    /**
     * Gets all the users on the system from the db
     * @param callback This is run at the end
     */
    getUsers: function getUsers(callback){
        MongoController.findMultipleFromDB("WebProject", "Users", {}, callback);
    },
    /**
     * This will get a singular user from the db
     * @param name the user to search for
     * @param callback This is run at the end
     */
    getUser : function getUser (name, callback) {
        MongoController.findFromDB("WebProject", "Users", {"name": name}, callback);
    },
    /**
     * This will get all the roles
     * @param callback This will be run at the end
     */
    getRoles : function getRoles(callback){
        MongoController.findMultipleFromDB("WebProject", "Roles", {}, callback);
    },
    /**
     * update the username of the specified username to the value
     * @param id The id of the username to search for
     * @param newName The new name of the user
     */
    updateUsername : function updateUsername(id, newName){
        MongoController.replaceOneInDb("WebProject", "Users", {"id":id}, {$set:{"name":newName}})
    },
    /**
     * Updates the users password after salting and hashing
     * @param id The id of the user to change the password for
     * @param newPass The plaintext of the new password
     */
    updatePassword : function updatePassword(id, newPass){
        bcrypt.hash(newPass,saltRounds, function (err,res){
            MongoController.replaceOneInDb("WebProject", "Users", {"id":id}, {$set:{"pass":res}})
        });
    },
    /**
     *  This updates the role of the user
     * @param id The id of the user to change
     * @param newRole The role you want to change the user to use
     */
    updateUserRole : function updateRole(id, newRole){
        console.log(id);
        console.log(newRole);
      MongoController.replaceOneInDb("WebProject", "Users", {"id":id}, {$set:{"role":newRole}})
    },
    /**
     * This adds the specified role to a db
     * @param name The name of the role to add
     * @param callback The callback to run after the insertion
     */
    addRole : function addRole(name, callback){
        MongoController.insertIntoDB("WebProject", "Roles", {"Role":name}, callback);
    },
    /**
     * Finds if the specified role is in the db
     * @param name The name of the role to search for
     * @param callback The callback run after the check
     */
    checkRole : function checkRole(name,callback){
        MongoController.findFromDB("WebProject", "Roles", {"Role":name}, callback);
    },
    /**
     * Deletes the specified role in the db
     * @param name The role to search for
     * @param callback The code run after the delete
     */
    deleteRole : function deleteRole(name,callback){
        MongoController.deleteRecordsFromDb("WebProject", "Roles" , {"Role":name}, false, callback);
    },
    /**
     * Updates all users and roles with the specified role to match the specified role
     * @param roleToEdit Search param
     * @param roleToEditTo Modify param
     * @param callback Run at end of update
     */
    updateRole: function updateRole (roleToEdit, roleToEditTo, callback){
        MongoController.updateDb("WebProject", "Users", {"role":roleToEdit},  {$set:{"role":roleToEditTo}}, function (err,res) {
            MongoController.replaceOneInDb("WebProject", "Roles", {"Role":roleToEdit}, {$set:{"Role":roleToEditTo}},callback);
        });
    },
    /**
     * deletes the specified user from the db
     * @param name The name of the user
     * @param callback Run after the delete
     */
    deleteUser : function deleteUser(name, callback){
        MongoController.deleteRecordsFromDb("WebProject", "Users" , {"name":name}, false, callback);
    }
}