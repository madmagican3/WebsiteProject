var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var AuthController = require('./Controller/AuthController');
var Routes = require('./routes/Routes');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser('ThisIsARandomStringOfCharactersForAllowingEncryptionOfTheCookies'));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


Routes.setupRoutes(app, function (res){
    app = res;
});

//Setup cookie clearer
//https://stackoverflow.com/questions/24553863/how-do-i-call-a-function-at-start-in-expressjs-nodejs-setup-method
//http://www.informit.com/articles/article.aspx?p=2265407&seqNum=5
/**
 * This will delete the expired cookies every 10 minutes
 */
setInterval(function (err, res) {
    if (err) throw err;
    AuthController.clearCookies();
}, 60000);





// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
