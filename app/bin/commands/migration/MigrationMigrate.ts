import Migration from "../../../Core/Migration";

export default class MigrationMigrate {
    static commandName = "migration:migrate";

    static async action() {
        await Migration.migrate();
        process.exit();
    }
}
