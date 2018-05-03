/**
 * passport.js
*/

'use strict';
var passport = require('passport');
var LocalStrategy   = require('passport-local').Strategy;
var LdapStrategy    = require('passport-ldapauth').Strategy;
var dbController = require('./../database/mysql.js')

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    // LOCAL LOGIN
    passport.use(new LocalStrategy({ // local 전략을 세움
        usernameField: 'username',
        passwordField: 'password',
        session: true, // 세션에 저장 여부
        passReqToCallback : true
        }, 
        function(req, username, password, done) {
            dbController.connection.query("SELECT * FROM `user` WHERE `id` = '" + username + "'",function(err,rows){
                if (err)
                    return done(err);

                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                } 

                // all is well, return successful user
                return done(null, rows[0]);
            });
        }
    ));
};
