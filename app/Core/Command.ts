export default class Command {
    static commandName: string;

    static match(specifiedName) {
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

    static parse(argv) {
        if (argv.length < 4) {
            return {};
        }
        let argsObject = {};
        const args = argv.slice(3).join(" ");

        for (let i=0;i<args.length;i++) {
            if (args[i] == "-") {
                let attr = "";
                if (args[i]+args[i+1] == "--")
                    i += 2;
                else
                    i += 1;

                while (i < args.length && args[i] != " ") {
                    attr += args[i];
                    i += 1;
                }
                while (i < args.length && args[i] == " ") {
                    i += 1;
                }
                if (args[i] != "-") {
                    if (i < args.length && (args[i] == "'" || args[i] == '"')) {
                        let quote = args[i];
                        let value = "";
                        i += 1;
                        while (i < args.length && args[i] != quote) {
                            value += args[i];
                            i += 1;
                        }
                        argsObject[attr] = value != "" ? value : true;
                    } else {
                        let value = "";
                        while (i < args.length && args[i] != " ") {
                            value += args[i];
                            i += 1;
                        }
                        argsObject[attr] = value != "" ? value : true;
                    }
                } else {
                    argsObject[attr] = true;
                }
            } else if (args[i] != " ") {
                let value = "";
                if (i < args.length && (args[i] == "'" || args[i] == '"')) {
                    let quote = args[i];
                    i += 1;
                    while (i < args.length && args[i] != quote) {
                        value += args[i];
                        i += 1;
                    }
                } else {
                    while (i < args.length && args[i] != " ") {
                        value += args[i];
                        i += 1;
                    }
                }
                let j = 0;
                while (typeof(argsObject[j]) != "undefined") {
                    j += 1;
                }
                argsObject[j] = value;
            }
        }
        return argsObject;
    }

    static async action(args) {}
}
