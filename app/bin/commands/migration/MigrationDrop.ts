import Migration from "../../../Core/Migration";
import Command from "../../../Core/Command";

export default class MigrationMigrate extends Command {
    static commandName = "migration:drop";
    static description = "Suprimmer la base de donné";

    static async action(_) {
        if (!await this.validQuestion("Voulez vous supprimer la base de donnée (Y/n) ? ",['y','yes','oui','o']))
            return;

        console.log("Suppression...");
        await Migration.drop();
        console.log("Base de donnée supprimée!");
        process.exit();
    }
}
