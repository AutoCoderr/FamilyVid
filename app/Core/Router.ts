const fs = require("fs-extra");

export default function Router(app) {
    const controllers = JSON.parse(fs.readFileSync(__dirname+"/../config/routes.json"));

    for (const controllerName in controllers) {
        const controllerPath = __dirname+"/../Controllers/"+controllerName+".js";
        if (fs.existsSync(controllerPath) && !fs.statSync(controllerPath).isDirectory()) {
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
                    let methods = ["get"];
                    if (config.methods != undefined) {
                        methods = config.methods.map(method => method.toLowerCase());
                    }
                    for (const method of methods) {
                        app[method](prefix_route+config.route , (req,res) => {
                            const controller = new C(req,res);
                            if (controller.canAccess()) {
                                controller[action]();
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
