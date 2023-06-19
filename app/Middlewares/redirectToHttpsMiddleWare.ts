export default function redirectToHttpsMiddleWare(req,res,next) {
    if (req.protocol == "http") {
        res.redirect(302, "https://" + req.headers.host + req.originalUrl);
    } else {
        next();
    }
}
