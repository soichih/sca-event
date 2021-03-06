'use strict';

const fs = require('fs');
const winston = require('winston');
const request = require('request');

const sca_host = "https://soichi7.ppa.iu.edu";

exports.sca = {
    auth_api: "https://soichi7.ppa.iu.edu/api/auth",

    //jwt token used to access other services (like auth service)
    jwt: fs.readFileSync(__dirname+'/sca.jwt'),
}

//warning.. you don't get error message if your user/pass etc. are incorrect (it just keeps retrying silently..)
exports.event = {
    amqp: {
        url: "amqp://event:eventpass123@soichi7.ppa.iu.edu:5672/sca"
    },
    
    //list of exchanges that this service supports and check_access cb
    //in check_access, you can make 3rd party api call to check for user access
    //or just check the jwt sent from the client (TODO is this really possible via websocket?)
    exchanges: {
        //wf: fs.readFileSync('/home/hayashis/git/sca-wf/config/wf.pub'),
        //other: fs.readFileSync('/home/hayashis/git/sca-wf/config/wf.pub'),

        "wf.task": function(req, key, cb) {
            //checking access for key
            request.get({
                url: sca_host+"/api/wf/event/checkaccess/task/"+key,
                json: true,
                headers: {'Authorization': 'Bearer '+req.query.jwt}
            }, function(err, res, body) {
                cb(err, (body.status == "ok"));
            });
        },

        "dicom.series": function(req, key, cb) {
            //checking access for key
            console.log("checking dicom.series access for "+key);
            request.get({
                url: sca_host+"/api/dicom/event/checkaccess/series/"+key,
                json: true,
                headers: {'Authorization': 'Bearer '+req.query.jwt}
            }, function(err, res, body) {
                console.dir(body);
                cb(err, (body.status == "ok"));
            });
        }
    }
}

exports.handler = {
    email: {
        from: "hayashis@iu.edu",
    }
}

//you need to allow websocket upgrade on your webserver if you are proxying
//(nginx)
//proxy_set_header Upgrade $http_upgrade;
//proxy_set_header Connection "upgrade";
//proxy_set_header Host $host;

exports.mongodb = "mongodb://mongo/event";

exports.express = {
    port: 8080,

    //public key used to validate user requests
    pubkey: fs.readFileSync(__dirname+'/auth.pub'),
}

exports.logger = {
    winston: {
        //hide header that might contain jwt
        requestWhitelist: ['url', /*'headers',*/ 'method', 'httpVersion', 'originalUrl', 'query'],
        transports: [
            //display all logs to console
            new winston.transports.Console({
                timestamp: function() {
                    var d = new Date();
                    return d.toString(); //show timestamp
                },
                colorize: true,
                level: 'debug'
            }),

            /*
            //store all warnings / errors in error.log
            new (winston.transports.File)({ 
                filename: '/var/log/sca/error.log',
                level: 'warn'
            })
            */
        ]
    },
}


