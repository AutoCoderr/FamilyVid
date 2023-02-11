import Helpers from "./Helpers";

const fs = require("fs-extra");

let controllers: any = null;

export default async function Router(app) {

    controllers = JSON.parse(await fs.readFile(__dirname + "/../config/routes.json"));
    Helpers.controllers = controllers;

    for (const controllerName in controllers) {
        const controllerPath = __dirname+"/../Controllers/"+controllerName+".js";
        if (await fs.exists(controllerPath) && !(await fs.stat(controllerPath)).isDirectory()) {
            const C = require(controllerPath).default;
            const controller = new C(null,null);

            const controllerConfig = controllers[controllerName];
            let prefix_route = "";
            if (typeof(controllerConfig.prefix_route) != "undefined") {
                prefix_route = controllerConfig.prefix_route;
            }

            for (const routeName in controllerConfig.routes) {
                const config = controllerConfig.routes[routeName];
                let action = routeName;
                if (typeof(controller[config.action]) != "undefined") {
                    action = config.action;
                }

                if (typeof(controller[action]) != "undefined") {
                    let methods: string|Array<string> = ["get"];
                    if (config.methods != undefined) {
                        methods = config.methods;
                    } else if(config.method != undefined) {
                        methods = config.method;
                    }
                    if (typeof(methods) === "string") {
                        methods = [methods];
                    }
                    if (methods instanceof Array) {
                        methods = methods.map(method => method.toLowerCase());
                    }

                    for (const method of methods) {
                        app[method](prefix_route+config.route , async (req,res) => {
                            const controller = new C(req,res);
                            if (await controller.canAccess()) {
                                controller[action]().catch(e => {
                                    res.send("ERROR 500");
                                    throw e;
                                });
                            }
                        });
                    }
                } else {
                    console.log("the '"+controllerConfig.prefix+routeName+"' route in not correctly configured");
                }
            }
        } else {
            console.log("the '"+controllerName+"' controller in not correctly configured");
        }
    }
}
