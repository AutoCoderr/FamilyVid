import Migration from "../../../Core/Migration";
import Command from "../../../Core/Command";

export default class MigrationMigrate extends Command {
    static commandName = "migration:migrate";

    static async action(_) {
        await Migration.migrate();
        process.exit();
    }
}
