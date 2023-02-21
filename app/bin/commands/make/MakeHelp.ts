import Command from "../../../Core/Command";

export default class MakeHelp extends Command {
    static commandName = "make";

    static async action(_) {
        console.log("Possibles options :");
        console.log("\t- make:entity");
    }
}
