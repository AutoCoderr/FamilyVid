export default class Command {
    static commandName: string;

    static match(specifiedName): boolean {
        const splittedSpecifiedName = specifiedName.split(":");
        const splittedCommandName = this.commandName.split(":");
        if (splittedSpecifiedName.length != splittedCommandName.length) {
            return false;
        }
        for (let i=0;i<splittedSpecifiedName.length;i++) {
            if (splittedCommandName[i].replace(splittedSpecifiedName[i],"") == splittedCommandName[i]) {
                return false;
            }
        }
        return true;
    }

    static async start(argv) {
        let args = this.parse(argv);
        args = this.computeArgs(args,this.argsModel);
        if (args) {
            await this.action(args);
        }
    }

    static computeArgs(args,model) {
        let out: any = {};
        let fails: Array<any> = []
        let argsWithoutKeyDefined = false;
        for (const attr in model) {
            if (attr[0] != "$") {
                let found = false;
                for (let field of model[attr].fields) {
                    if (args[field] != undefined &&
                        (
                            typeof(args[field]) == model[attr].type ||
                            (
                                model[attr].type == "string" &&
                                typeof(args[field]) == "number"
                            )
                        )
                    ) {
                        out[attr] = args[field];
                        found = true;
                        break;
                    } else if (args[field] != undefined && (typeof (args[field]) != model[attr].type)) {
                        console.log(field + " (" + model[attr].type + ") : type donné incorrect");
                    }
                }
                if (!found && (model[attr].required == undefined || model[attr].required)) fails.push(model[attr]);
            } else if (attr == "$argsWithoutKey" && !argsWithoutKeyDefined) {
                argsWithoutKeyDefined = true;
                const argsWithoutKey = model[attr];
                for (let i=0;i<argsWithoutKey.length;i++) {
                    if (args[i] == undefined || typeof(args[i]) != argsWithoutKey[i].type) {
                        if (args[i] != undefined) {
                            console.log(argsWithoutKey[i].field + " (" + argsWithoutKey[i].type + ") : type donné incorrect");
                        }
                        fails.push(argsWithoutKey[i]);
                    } else {
                        out[argsWithoutKey[i].field] = args[i];
                    }
                }
            }
        }
        if (fails.length > 0) {
            console.log("\nArguments manquants ou invalides :");
            for (const fail of fails) {
                console.log("      " + (fail.fields instanceof Array ? fail.fields.join(", ") : fail.field) + " : " + fail.description + " | (type attendu : " + fail.type + ")");
            }
            console.log("\n");
            this.help();
            return false;
        }
        return out;
    }

    static parse(argv) {
        if (argv.length < 4) {
            return {};
        }
        let argsObject = {};
        let attr: null|string = null;
        for (let i=3;i<argv.length;i++) {
            if (argv[i][0] == "-") {
                if (attr != null) {
                    argsObject[attr] = true;
                }
                attr = argv[i];
            } else {
                if (attr != null) {
                    let value = argv[i];
                    if (isNumber(value))
                        value = parseInt(value);
                    else if (value == "true" || value == "false")
                        value = value == "true";

                    argsObject[attr] = value;
                    attr = null;
                } else {
                    let value = argv[i];
                    if (isNumber(value))
                        value = parseInt(value);
                    else if (value == "true" || value == "false")
                        value = value == "true";

                    let j = 0;
                    while (typeof(argsObject[j]) != "undefined") {
                        j += 1;
                    }
                    argsObject[j] = value;
                }
            }
        }
        if (attr != null) {
            argsObject[attr] = true;
            attr = null;
        }

        return argsObject;
    }

    static argsModel = {};

    static async action(_) {}

    static help(){}
}

function isNumber(num: number|string) {
    return typeof(num) == "number" ||
        (parseInt(num).toString() == num && num != "NaN");
}
