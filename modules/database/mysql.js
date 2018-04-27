var dateFormat = require('dateformat');
var moment = require('moment');
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '<host>',
  user     : '<username>',
  password : '<password>',
  database : '<databasename>'
});

module.exports = {
    connection : connection
};