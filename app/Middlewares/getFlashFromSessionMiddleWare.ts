export default function getFlashFromSessionMiddleWare(req, res, next) {
    if (req.session.flash && Object.keys(req.session.flash).length > 0) {
        for (let key in req.session.flash) {
            res.locals[key] = req.session.flash[key];
            delete req.session.flash[key];
        }
    }
    next();
}
