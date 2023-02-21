import Command from "../../../Core/Command";

export default class FixtureHelp extends Command {
    static commandName = "fixtures";

    static async action(_) {
        console.log("Possibles options :");
        console.log("\t- fixtures:load");
    }
}
