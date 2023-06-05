import Helpers from "./Helpers";

const fs = require("fs-extra");

const routesPath = __dirname+"/../config/routes";

export default async function Router(app,subFolder = "/") {

    const controllersJson = await fs.readdir(routesPath+subFolder)
    if (subFolder == "/")
        Helpers.controllers = {};

    for (const controllerJson of controllersJson) {
        const controllerJsonPath = routesPath+subFolder+controllerJson;
        if (controllerJson.endsWith(".json") && !(await fs.stat(controllerJsonPath)).isDirectory()) {
            const controllerName = controllerJson.split(".").slice(0, -1).join(".");
            const controllerPath = __dirname + "/../Controllers"+subFolder+"/" + controllerName + ".js";
            if (await fs.exists(controllerPath) && !(await fs.stat(controllerPath)).isDirectory()) {
                const C = require(controllerPath).default;
                const controller = new C(null, null);

                const controllerConfig = JSON.parse(await fs.readFile(controllerJsonPath));
                Helpers.controllers[controllerName] = controllerConfig;

                const prefix_route = controllerConfig.prefix_route ?? "";

                for (const routeName in controllerConfig.routes) {
                    const config = controllerConfig.routes[routeName];
                    const action = controller[config.action] ?? routeName;

                    if (typeof (controller[action]) != "undefined") {
                        let methods: string | Array<string> = ["get"];
                        if (config.methods != undefined) {
                            methods = config.methods;
                        } else if (config.method != undefined) {
                            methods = config.method;
                        }
                        if (typeof (methods) === "string") {
                            methods = [methods];
                        }
                        if (methods instanceof Array) {
                            methods = methods.map(method => method.toLowerCase());
                        }

                        for (const method of methods) {
                            app[method](prefix_route + config.route, async (req, res) => {
                                const controller = new C(req, res);
                                controller[action]().catch(e => {
                                    res.send("ERROR 500");
                                    throw e;
                                });
                            });
                        }
                    } else {
                        console.log("the '" + controllerConfig.prefix + routeName + "' route in not correctly configured");
                    }
                }
            } else {
                console.log("the '" + controllerName + "' controller in not correctly configured");
            }
        } else if (!controllerJson.endsWith(".json") && (await fs.stat(controllerJsonPath)).isDirectory()) {
            await Router(app,subFolder+controllerJson+"/");
        }
    }
}
