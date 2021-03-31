import crypto from "crypto";
import EntityManager from "./EntityManager";
const fs = require("fs-extra");

export default class Helpers {
    constructor() {
    }

    static getDatas(req) {
        if (req.method === "GET") {
            return {...req.query};
        } else if (req.method == "POST") {
            return {...req.body};
        }
        return {};
    }

    static hashPassword(str) {
        let sha1 = crypto.createHash("sha1");
        sha1.update(str);
        return sha1.digest("hex");
    }

    static replaceAll(str,A,B) {
        while (str.replace(A,B) != str) {
            str = str.replace(A,B);
        }
        return str;
    }

    static ucFirst = str => str.charAt(0).toUpperCase()+str.slice(1);

    static getPath(pathName, params = {}) {
        const controllers = JSON.parse(fs.readFileSync(__dirname+"/../config/routes.json"));
        const regexReplacer = new RegExp(":[a-zA-Z0-9_]+");
        const replacer = (match,index,content) => {
            match = match.slice(1);
            if (params[match] != undefined) {
                return params[match];
            }
            console.log("url '"+content+"' has a parameter ':"+match+"' which is not setted");
            return match;
        };

        for (const controllerName in controllers) {
            const controllerSettings = controllers[controllerName];
            const {routes} = controllerSettings;
            let prefix = "";
            if (typeof(controllerSettings.prefix) != "undefined") {
                prefix = controllerSettings.prefix;
            }

            let prefix_route = "";
            if (typeof(controllerSettings.prefix_route) != "undefined") {
                prefix_route = controllerSettings.prefix_route;
            }

            if (pathName.length >= prefix.length && pathName.substring(0,prefix.length) == prefix &&
                routes[pathName.substring(prefix.length)] != undefined) {
                let route = prefix_route+routes[pathName.substring(prefix.length)].route;

                while (route != route.replace(regexReplacer,replacer)) {
                    route = route.replace(regexReplacer,replacer);
                }

                return route;
            }
        }
        console.log("Nothing route found for "+pathName);
        return "#nothing";
    }

    static serializeEntityArray(entities: Array<any>) {
        return Promise.all(entities.map(exemplaire => exemplaire.serialize()));
    }

    static addMissingZero(num: string|number, nb = 2) {
        if (typeof(num) == "number") num = num.toString();

        while (num.length < nb) {
            num = '0'+num;
        }
        return num;
    }

    static hydrateForm(entity: EntityManager, form) {
        for (const name in form.fields) {
            if (typeof(entity["get"+this.ucFirst(name)]) == "function") {
                let value = entity["get"+this.ucFirst(name)]();
                if (!(value instanceof Array) && !(value instanceof EntityManager)) {
                    if (value instanceof Date) {
                        value = value.getFullYear() + "-" + this.addMissingZero(value.getMonth() + 1) + "-" + this.addMissingZero(value.getDate());
                    }
                    form.fields[name].value = value;
                }
            }
        }
        return form;
    }
};
