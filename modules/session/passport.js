/**
 * passport.js
*/

'use strict';
var passport = require('passport');
var LocalStrategy   = require('passport-local').Strategy;
var dbController = require('./../database/mysql.js');
var ldapController = require('./../database/ldap.js');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
       
    passport.deserializeUser(function (id, done) {
        done(null, id);
    });

    // LOCAL LOGIN
    passport.use(new LocalStrategy({ // local 전략을 세움
        usernameField: 'username',
        passwordField: 'password',
        session: true, // 세션에 저장 여부
        passReqToCallback : true
        }, 
        function(req, username, password, done) {
            dbController.isAuthenticatedUser(req, username, password, done, ldapController.isAuthenticatedUser);
        }
    ));
};
