const Migration = require("../../../Core/Migration").default;

module.exports = class MigrationMigrate {
    static commandName = "migration:migrate";

    static async action() {
        await Migration.migrate();
        process.exit();
    }
}
