import Command from "../../../Core/Command";

export default class MakeEntity extends Command {
    static commandName = "make:entity";
    static description = "Créer une entitée";

    static async action(_) {
        console.log("Cette commande ne fait encore rien pour le moment");
    }
}
