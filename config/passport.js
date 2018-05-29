// config/passport.js

// load all the things we need
var FacebookStrategy = require('passport-facebook').Strategy;
// load up the user model
var configAuth = require('./auth');
var webuser = require('../app/models/webuser.js');

// expose this function to our app using module.exports
module.exports = function(connection, passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(profileid, done) {
        console.log("serializing: " + profileid)
        done(null, profileid);
    });

    // used to deserialize the user
    passport.deserializeUser(function(profileid, done) {
        console.log("deserializing: " + profileid)
        webuser.find(connection, profileid, function(err, user) {
            if (err) {
                console.log(err)
            } else {
            console.log(user)
            done(null, user[0]);
            }
        });
        
    });

  passport.use(new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields: ['id', 'email', 'gender', 'locale', 'name', 'timezone', 'location'],
        scope : ['email', 'user_hometown','user_location']
    },

   


    function(token, refreshToken, profile, done) {
       
         // terminate if not me for testing
    //    if (profile.id != '10154720984505706') return false;

        process.nextTick(function() {

            // try to find the user based on their fb id
             console.log(profile.id);

                  
                       webuser.add(
                           connection, 
                           profile._json.first_name, 
                           profile._json.last_name, 
                           profile.id, 
                           profile.gender, 
                           "", 
                           token, function(err, cb) {
                                if (err) {
                                    console.log("Exists - updating last login time")
                                    webuser.updateLastLogin(connection, profile.id, function(e, r) {
                                        if (e) {
                                            console.log(e);
                                        } else {
                                            console.log("time updated")
                                        }
                                    })

                                } else {
                                    console.log("New User Added")
                                }
                           });
                           return done(null,profile.id)
                 /*      webuser.find(connection, profile.id, function(err, user) {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log("Logging in user: " + user[0])
                                return done(null, user[0])
                            }
                            
                        });
                */
                    
              /*      user.create(profile.id, token, profile._json.first_name, profile._json.last_name, profile.gender, profile._json, true, function(err, callback) {
                         if (err) {
                            console.log(err);
                         }
                         return done(null, callback);
                    }); */
                    
                });
            }));
        

    };
