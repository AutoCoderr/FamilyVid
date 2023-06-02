import Router from "./Core/Router";
import Helpers from "./Core/Helpers";
import env from "./Core/env";
import http from "http";
import https from "https";
import fs from "fs-extra";
import setTZ from "set-tz";
import checkPermsMiddleware from "./Middlewares/checkPermsMiddleware";
import getFlashFromSessionMiddleWare from "./Middlewares/getFlashFromSessionMiddleWare";
import redirectToHttpsMiddleWare from "./Middlewares/redirectToHttpsMiddleWare";

const Twig = require("twig");
const {twig} = Twig;
const express = require("express");
const session = require('express-session');
const fileUpload = require('express-fileupload');

setTZ(env.TIMEZONE);

Twig.extendFunction('path', (pathName, params = {}) =>
    Helpers.getPath(pathName, params)
);
Twig.extendFunction('csrf_token', (key,session) => {
    if (session.tokens === undefined) {
        session.tokens = {};
    }
    session.tokens[key] = Helpers.generateRandomString(20);
    return "<input type='hidden' name='csrf_token' value='"+session.tokens[key]+"'>";
});

const app = express();
app.use(express.json());
app.use(express.urlencoded());
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

app.use(checkPermsMiddleware);
app.use(getFlashFromSessionMiddleWare);

app.set('views', 'Views');
app.set('view engine', 'twig');

const httpServer = http.createServer(app);
httpServer.listen(80);

if (env.SSL_ENABLED) {
    (async () => {
        const sslPath = __dirname + "/ssl/";
        if ((
                !await fs.exists(sslPath + env.SSL_CERTIFICATE) ||
                !await fs.exists(sslPath + env.SSL_PRIVATE_KEY)
            ) ||
            (
                await fs.stat(sslPath + env.SSL_CERTIFICATE).then(stat => stat.isDirectory()) ||
                await fs.stat(sslPath + env.SSL_PRIVATE_KEY).then(stat => stat.isDirectory())
            )) {
            throw new Error("'SSL_CERTIFICATE' or 'SSL_PRIVATE_KEY' are not correctly set");
        }
        const credentials = {
            key: await fs.readFile(sslPath + env.SSL_PRIVATE_KEY, 'utf8'),
            cert: await fs.readFile(sslPath + env.SSL_CERTIFICATE, 'utf8')
        }
        if (env.SSL_REDIRECT_HTTP_TO_HTTPS) {
            app.use(redirectToHttpsMiddleWare);
        }
        const httpsServer = https.createServer(credentials, app);
        httpsServer.listen(443);

    })().then(() => Router(app));
} else {
    Router(app);
}

console.log("Server started");
