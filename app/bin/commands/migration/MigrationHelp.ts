import Command from "../../../Core/Command";

export default class MigrationHelp extends Command {
    static commandName = "migration";

    static async action(_) {
        console.log("Possibles options :");
        console.log("\t- migration:migrate");
    }
}
