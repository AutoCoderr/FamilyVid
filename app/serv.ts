import Router from "./Core/Router";
import Helpers from "./Core/Helpers";
import env from "./Core/env";
import http from "http";
import https from "https";
import fs from 'fs-extra';

const Twig = require("twig");
const {twig} = Twig;
const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');

Twig.extendFunction('path', (pathName, params = {}) =>
    Helpers.getPath(pathName, params)
);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(session({
    secret: 'pVkEmEums7PD7kCuhkqF',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60*60*1000 }
}));
app.use(fileUpload({
    limits: { fileSize: env.UPLOAD_SIZE_LIMIT+1 }
}));

app.use(express.static('public'));
app.use(function(req, res, next){
    if (req.session.flash && Object.keys(req.session.flash).length > 0) {
        for (let key in req.session.flash) {
            res.locals[key] = req.session.flash[key];
            delete req.session.flash[key];
        }
    }
    next();
});

app.set('views', 'Views');
app.set('view engine', 'twig');

if (env.SSL_ENABLED) {
    const sslPath = __dirname+"/ssl/";
    if ((!fs.existsSync(sslPath+env.SSL_CERTIFICATE) || !fs.existsSync(sslPath+env.SSL_PRIVATE_KEY)) ||
        (fs.statSync(sslPath+env.SSL_CERTIFICATE).isDirectory() || fs.statSync(sslPath+env.SSL_CERTIFICATE).isDirectory()) ) {
        throw new Error("'SSL_CERTIFICATE' and 'SSL_PRIVATE_KEY' are not correctly set");
    }
    const credentials = {
        key: fs.readFileSync(sslPath+env.SSL_PRIVATE_KEY, 'utf8'),
        cert: fs.readFileSync(sslPath+env.SSL_CERTIFICATE, 'utf8')
    }
    if (env.SSL_REDIRECT_HTTP_TO_HTTPS) {
        app.use(function (req, res, next) {
            if (req.protocol == "http") {
                res.redirect(302, "https://" + req.headers.host + req.originalUrl);
            } else {
                next();
            }
        });
    }
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(443);
}

const httpServer = http.createServer(app);
httpServer.listen(80);

Router(app);

console.log("Server started");
