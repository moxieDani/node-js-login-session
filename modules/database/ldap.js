var ldap = require('ldapjs');

var client = ldap.createClient({
    url: 'ldap://192.1.1.1:389'
});

function setSearchOption(username) {
    return { filter: '(samaccountname='+username+')', scope: 'sub', attributes: ['sAMAccountName','mail'] };
}

module.exports = {
    isAuthenticatedUser : function isAuthenticatedUser(req, username, password, ret, done) {
        try {
            client.bind(username+'@nexstreaming.com', password, function (error) {
                if (error) {
                    return done(null, false, req.flash('loginMessage', 'Invalid ID or PW. - ' + error.message));
                }

                client.bind('ldapadmin1@nexstreaming.com', 'goAuthLdap09!', function (error) {
                    if (error) {
                        return done(null, false, req.flash('loginMessage', 'Invalid ID or PW. - ' + error.message));
                    }
                    var option = setSearchOption(username);
                    client.search('OU=NexStreaming,DC=nexstreaming,DC=com', option, function (error, res) {
                        res.on('searchEntry', function(entry) {
                            if(entry.object){
                                ret.username = entry.object['sAMAccountName'];
                                ret.email = entry.object['mail'];
                            }
                            return done(null,ret);
                        });

                        res.on('error', function(error) {
                            return done(null, false, req.flash('loginMessage', 'Invalid ID or PW. - ' + error.message));
                        });
                    });
                });
            });
        } catch(error){
            client.unbind(function(error) {if(error){console.log(error.message);} else{console.log('client disconnected');}});
            return done(null, false, req.flash('loginMessage', 'Invalid ID or PW. - ' + error.message));
        }
    }
};