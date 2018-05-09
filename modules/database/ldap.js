var ldap = require('ldapjs');

var client = ldap.createClient({
    url: 'ldap://ldap.forumsys.com  :389'
});

function setSearchOption(username) {
    return { filter: "(uid=tesla)", scope: 'sub', attributes: ['sn','mail'] };
}

module.exports = {
    isAuthenticatedUser : function isAuthenticatedUser(req, username, password, ret, done) {
        try {
            client.bind('cn=read-only-admin,dc=example,dc=com', 'password', function (error) {
                if (error) {
                    return done(null, false, req.flash('loginMessage', 'Invalid ID or PW. - ' + error.message));
                }
                var option = setSearchOption(username);
                client.search('dc=example,dc=com', option, function (error, res) {
                    res.on('searchEntry', function(entry) {
                        if(entry.object){
                            console.log(JSON.stringify(entry.object));
                            ret.username = entry.object['sn'];
                            ret.email = entry.object['mail'];
                        }
                        return done(null,ret);
                    });

                    res.on('error', function(error) {
                        return done(null, false, req.flash('loginMessage', 'Invalid ID or PW. - ' + error.message));
                    });
                });
            });
        } catch(error){
            client.unbind(function(error) {if(error){console.log(error.message);} else{console.log('client disconnected');}});
            return done(null, false, req.flash('loginMessage', 'Invalid ID or PW. - ' + error.message));
        }
    }
};