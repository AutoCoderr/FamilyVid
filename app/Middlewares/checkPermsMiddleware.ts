import Helpers from "../Core/Helpers";
import * as fs from "fs/promises";

export default async function checkPermsMiddleware(req,res,next) {
    if (Helpers.security == null) {
        Helpers.security = JSON.parse(await fs.readFile(__dirname + "/../config/security.json").then(res => res.toString()));
    }

    const security = Helpers.security;

    for (const permission of security.permissions) {
        const regex = new RegExp(permission.path);

        if (typeof(permission.methods) == "string") permission.methods = [permission.methods];

        if (regex.test(req.originalUrl) &&
            (
                typeof(permission.methods) == "undefined" ||
                permission.methods.includes(req.method)
            ) &&
            typeof(permission.roles) != "undefined") {


            if (typeof(permission.roles) == "string") {
                permission.roles = [permission.roles];
            }

            if (typeof(req.session.user) == "undefined" ||
                (
                    typeof(req.session.user) != "undefined" &&
                    !permission.roles.includes("connected") &&
                    (
                        typeof(req.session.user.roles) == "undefined" ||
                        !permission.roles.find(role => req.session.user.roles.includes(role))
                    )
                )
            ) {
                if (typeof(req.session.user) == "undefined") {
                    res.redirect(302,Helpers.getPath(security.redirect_not_connected))
                } else {
                    res.redirect(302,Helpers.getPath(security.redirect_not_permission))
                }
                return;
            }
        }
    }
    next()
}
