import Command from "../../../Core/Command";

export default class UserCreate extends Command {
    static commandName = "user:create";

    static argsModel = {
        email: {fields: ["--email","-e"], type:"string", description: "L'adresse mail"},
        firstname: {fields: ["--firstname", "-f"], type: "string", description: "Le prénom"},
        lastname: {fields: ["--lastname", "-l"], type: "string", description: "Le nom"},
        password: {fields: ["--password", "-p"], type: "string", description: "Le mot de passe"},
        test: {fields: ["--test","-t"], type: "number", description: "Pour un test", required: false}
    };

    static async action(args: {email: string, firstname: string, lastname: string, password: string}) {
        console.log(args);
    }

    static help() {
        console.log("Exemple : node bin/console.js "+this.commandName+" -e|--email adresseMail -f|--firstname prenom -l|--lastname nom -p|--password motDePasse [-t|--test  unNombre]")
    }
}
