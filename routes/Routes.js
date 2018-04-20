var login = require('./Login');
var index = require('./Index');
var register = require('./Register');
var userManagement = require('./UserManagement');
var logout = require('./Logout');
var roles = require('../routes/Roles');
var eventManagement = require('../routes/EventManagament');
var partManagement = require('../routes/PartManagement');
var API = require('../routes/API');

module.exports = {
    setupRoutes : function setupRoutes(app, callback){
        //Setup the routers
        app.use('/', index);
        app.use('/login', login);
        app.use('/register', register);
        app.use('/userManagement', userManagement);
        app.use('/logout', logout);
        app.use('/roles', roles);
        app.use('/eventManagement', eventManagement);
        app.use('/part', partManagement);
        app.use('/api', API);
        callback(app);
    }
}

