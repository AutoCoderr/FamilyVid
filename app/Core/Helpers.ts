import env from './env';
import crypto from 'crypto';
import EntityManager from "./EntityManager";

export default class Helpers {
    static controllers: any = null;
    static security: any = null;

    static getDatas(req) {
        if (req.method === "GET") {
            return {...req.query};
        } else if (req.method == "POST") {
            let datas = {...req.body};
            if (req.files != undefined) {
                datas = {...datas, ...req.files};
            }
            return datas;
        }
        return {};
    }

    private static sha1(str) {
        const sha1 = crypto.createHash("sha1");
        sha1.update(str);
        return sha1.digest("hex");
    }

    static hashPassword(password): string {
        for (let i=0;i<env.SALT_NB;i++) {
            password = this.sha1(password+env.SALT);
        }
        return password;
    }

    static replaceAll(str,A,B) {
        while (str.replace(A,B) != str) {
            str = str.replace(A,B);
        }
        return str;
    }

    static ucFirst = str => str.charAt(0).toUpperCase()+str.slice(1);

    static getPath(pathName, params = {}) {
        const controllers = this.controllers;
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

    static formatDate(date: Date) {
        return date.getFullYear() + "-" + this.addMissingZero(date.getMonth() + 1) + "-" + this.addMissingZero(date.getDate())
    }

    static hydrateForm(entity: EntityManager, form) {
        for (const name in form.fields) {
            if (typeof(entity["get"+this.ucFirst(name)]) == "function") {
                let value = entity["get"+this.ucFirst(name)]();
                if (!(value instanceof Array) && !(value instanceof EntityManager)) {
                    if (value instanceof Date) {
                        value = this.formatDate(value);
                    }
                    form.fields[name].value = value;
                }
            }
        }
        return form;
    }

    static rand(a,b) {
        return a+Math.floor(Math.random()*(b-a+1));
    }

    static generateRandomString(nb, forbiddenChars: Array<string> = []) {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$%*!?/&#@";
        let token = "";
        while (token.length < nb) {
            const char = chars[Helpers.rand(0,chars.length-1)];
            if (!forbiddenChars.includes(char)) {
                token += char;
            }
        }
        return token;
    }

    static escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};
