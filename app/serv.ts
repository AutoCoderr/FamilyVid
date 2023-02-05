import Router from "./Core/Router";
import Helpers from "./Core/Helpers";

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
app.use(fileUpload());
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

app.listen(80);

Router(app);

console.log("Server started");
