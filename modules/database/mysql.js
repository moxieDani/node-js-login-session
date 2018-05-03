var dateFormat = require('dateformat');
var moment = require('moment');
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'vpc-aprs.cbsstddcgiz0.us-east-1.rds.amazonaws.com',
  user     : 'aprs',
  password : 'Nextuser1!',
  database : 'aprs_dev'
});

function getValidDateFormat(date) {
  var ret = "0000-00-00 00:00:00";

  if(moment(date, moment.ISO_8601, true).isValid())
      ret = dateFormat(date, "yyyy-mm-dd hh:mm:ss");

  return ret;
}

function getReleaseCountFieldName(table) {
    var ret = table.includes('ios') ? 'ino' : 'bno';
    return ret; 
}

function getTableDataCountQuery(queryInfo) {
    var ret = null;
    var releaseCountFieldName = getReleaseCountFieldName(queryInfo.dbTable);

    // Check data
    if (queryInfo) {
        var where = '';

        switch (queryInfo.dbTable) {
        case "basesdk":
        case "ios":
        case "tizen":
            where = "(use_yn='Y') AND right(vers, 5) "+(queryInfo.isTestSDK ? "=":"!=")+" '_TEST'";
            if (queryInfo.searchWord) {
            where += "AND ("+queryInfo.searchType+" LIKE '%"+queryInfo.searchWord+"%')";
            }
            ret = "SELECT COUNT(distinct vers) AS 'count' FROM "+queryInfo.dbTable+" WHERE "+where;
            break;
        case "basesdk_release" :
        case "ios_release" :
        case "tizen_release" :
            where = "(r.use_yn='Y') ";
            if (queryInfo.searchWord) {
            where += "AND ("+(queryInfo.searchType === "customer" ? "r." : "a.")+queryInfo.searchType+" LIKE '%"+queryInfo.searchWord+"%')";
            }
            ret = "SELECT count(r.no) AS 'count' FROM "+queryInfo.dbTable+" r LEFT JOIN "+queryInfo.dbTable.split('_')[0]+" a ON r."+releaseCountFieldName+"=a.no WHERE "+where;
            break;
        case "user" :
        case "user_log" :
            where = "(x.del_yn='N')";
            if (queryInfo.searchWord) {
            where += "AND (x."+queryInfo.searchType+" LIKE '%"+queryInfo.searchWord+"%')";
            }
            ret = "SELECT COUNT(*) AS 'count' FROM "+queryInfo.dbTable+" x WHERE "+where;
            break;
        case "customer" :
        case "customer_log" :
            where = "(x.del_yn='N')";
            if (queryInfo.searchWord) {
            where += "AND (x."+queryInfo.searchType+" LIKE '%"+queryInfo.searchWord+"%')";
            }
            ret = "SELECT COUNT(*) AS 'count' FROM "+queryInfo.dbTable+" x WHERE "+where;
            break;
        case "option_list" :
            where = "(x.no > 0)";
            if (queryInfo.searchWord) {
            where = "AND (x."+queryInfo.searchType+" LIKE '%"+queryInfo.searchWord+"%')";
            }
            ret = "SELECT COUNT(*) AS 'count' FROM "+queryInfo.dbTable+" x WHERE "+where;
            break;
        }
    }

    return ret;
}

function getTableDataQuery(queryInfo, pageInfo) {
    var ret = null;

    // Check data
    if (queryInfo) {
        var offset = pageInfo.offset;
        var currentPage = pageInfo.currentPage;
        var start = ((currentPage-1)*offset);
        var where = '';
        var releaseCountFieldName = getReleaseCountFieldName(queryInfo.dbTable);

        switch (queryInfo.dbTable) {
        case "basesdk":
        case "ios":
        case "tizen":
            where = "(x.use_yn='Y') AND right(vers, 5) "+(queryInfo.isTestSDK ? "=":"!=")+" '_TEST'";
            if (queryInfo.searchWord) {
            where += "AND (x."+queryInfo.searchType+" LIKE '%"+queryInfo.searchWord+"%')";
            }
            ret = "SELECT x.vers AS 'Version', ifnull(r.cnt, 0) 'Release Count',\
            x.register AS 'Register', x.release_date AS 'Regist Date',\
            'delete' AS 'Action'\
            FROM "+queryInfo.dbTable+" x\
            LEFT JOIN(\
                SELECT "+releaseCountFieldName+", count(no) cnt\
                FROM "+queryInfo.dbTable+"_release WHERE use_yn='Y'\
                GROUP BY "+releaseCountFieldName+") r ON x.no=r."+releaseCountFieldName+"\
            WHERE "+where+"\
            GROUP BY vers\
            ORDER BY x.release_date DESC, x.no DESC\
            LIMIT "+start+", "+offset;
            break;
        case "basesdk_release" :
        case "ios_release" :
        case "tizen_release" :
            where = "(r.use_yn='Y') ";
            if (queryInfo.searchWord) {
            where += "AND ("+(queryInfo.searchType === "customer" ? "r." : "a.")+queryInfo.searchType+" LIKE '%"+queryInfo.searchWord+"%')";
            }
            ret = "SELECT a.license_products AS 'Product Type', a.vers AS 'Version', r.customer AS 'Customer', r.release_date AS 'Regist Date', r.register AS 'Executor'\
            FROM "+queryInfo.dbTable+" r\
            LEFT JOIN "+queryInfo.dbTable.split('_')[0]+" a ON r."+releaseCountFieldName+"=a.no\
            LEFT JOIN customer c ON r.customer=c.id\
            WHERE "+where+"\
            ORDER BY r.release_date DESC, r.no DESC LIMIT "+start+", "+offset;
            break;
        case "user" :
        case "user_log" :
            where = "(x.del_yn='N')";
            if (queryInfo.searchWord) {
            where += "AND (x."+queryInfo.searchType+" LIKE '%"+queryInfo.searchWord+"%')";
            }
            ret = "SELECT x.id AS 'ID', x.name AS 'Name', "+(queryInfo.dbTable.includes('log') ? "" : "x.mail AS 'E-mail', ")+"x.regist_date AS 'Regist Date'\
            FROM "+queryInfo.dbTable+" x \
            WHERE "+where+"\
            ORDER BY x.regist_date DESC\
            LIMIT "+start+", "+offset;
            break;
        case "customer" :
        case "customer_log" :
            where = "(x.del_yn='N')";
            if (queryInfo.searchWord) {
            where += "AND (x."+queryInfo.searchType+" LIKE '%"+queryInfo.searchWord+"%')";
            }
            ret = "SELECT x.id AS 'ID', x.name AS 'Name', x.company AS 'Company', x.suspended AS 'Suspended',\
            x.account_manager AS 'Account Manager', x.support_engineer AS 'Support Engineer', x.regist_date AS 'Regist Date'\
            FROM "+queryInfo.dbTable+" x \
            WHERE "+where+"\
            ORDER BY x.regist_date DESC\
            LIMIT "+start+", "+offset;
            break;
        case "option_list" :
            where = "(no > 0)";
            if (queryInfo.searchWord) {
            where = "AND (x."+queryInfo.searchType+" LIKE '%"+queryInfo.searchWord+"%')";
            }
            ret = "SELECT x.option_name AS 'Option Name', x.option_type AS 'Option Type', x.id AS 'ID', x.company AS 'Company',\
            x.use_yn AS 'Validity', x.register AS 'Register', x.regist_date AS 'Regist Date'\
            FROM "+queryInfo.dbTable+" x \
            WHERE "+where+"\
            ORDER BY x.regist_date DESC\
            LIMIT "+start+", "+offset;
            break;
        }
    }

    return ret;
}

module.exports = {
    connection : connection,

    getQueryDataTableInfo : function getQueryDataTableInfo(queryInfo, callback) {
        var query = getTableDataCountQuery(queryInfo);
        var title = queryInfo.title;
        var ret = { keys: [], data: [], title: title };

        if (query) {
            connection.query(query, function(err, rows, fields) {
                if (err) throw err;
                if (rows[0]) {
                    var pageInfo = {
                        currentPage: queryInfo.currentPage ? Number(queryInfo.currentPage) : 1,
                        maxPage:Math.ceil(rows[0].count / 10),
                        offset:10
                    };

                    query = getTableDataQuery(queryInfo, pageInfo);
                    if (query) {
                        connection.query(query, function(err, rows, fields) {
                            if (err) throw err;
                            if (rows[0]) {
                                var keys = Object.keys(rows[0]);
                                for(var i=0; i<rows.length; i++) {
                                    rows[i]['Regist Date'] = getValidDateFormat(rows[i]['Regist Date']);
                                }
                                // Success.
                                callback({ keys: keys, data: rows, title: title, query:queryInfo, page:pageInfo});
                            } else {
                                callback({ keys: [], data: [], title: title, page:pageInfo });
                            }
                        });
                    }
                }
            });
        }
        else {
            return callback(ret);
        }
    },

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