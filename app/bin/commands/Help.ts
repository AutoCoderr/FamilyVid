import Command from "../../Core/Command";

export default class Help extends Command {
    static commandName = "help";

    static async action(_) {
        console.log("You can run :");
        console.log("\t- migration");
        console.log("\t- make");
        console.log("\t- fixtures");
    }
}
