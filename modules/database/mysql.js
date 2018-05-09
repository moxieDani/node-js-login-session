var dateFormat = require('dateformat');
var moment = require('moment');
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : '1234',
  database : 'node_js_login_session'
});

module.exports = {
    connection : connection,

    isAuthenticatedUser : function isAuthenticatedUser(req, username, password, done, callback) {
        connection.query("SELECT * FROM `user` WHERE `id` = '" + username + "'",function(error,rows){
            var ret = {};

            if (error)
                return done(error);

            if (!rows.length) {
                return done(null, false, req.flash('loginMessage', 'Invalid ID or PW. - No user in Database.'));
            }

            ret.authcode = rows[0]['auth_codes'].split(',');
            callback(req, username, password, ret, done);
            return rows[0];
        });
    }
};