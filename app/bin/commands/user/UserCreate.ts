import Command from "../../../Core/Command";
import CreateUserService from "../../../Services/CreateUserService";

export default class UserCreate extends Command {
    static commandName = "user:create";
    static description = "Créer un utilisateur";

    static argsModel = {
        email: {fields: ["--email","-e"], type:"string", description: "L'adresse mail"},
        firstname: {fields: ["--firstname", "-f"], type: "string", description: "Le prénom"},
        lastname: {fields: ["--lastname", "-l"], type: "string", description: "Le nom"},
        password: {fields: ["--password", "-p"], type: "string", description: "Le mot de passe"},
        families: {fields: ["--families", "-fa"], type: "string", description: "Les familles de l'utilisateur", required: false},
        requestPassword: {fields: ["--request-password"], type: "string", description: "Pour envoyer un mail de réinitialisation de mot de passe, nécessite de spécifier l'adresse externe du serveur", required: false}
    };

    static async action(args: {email: string, firstname: string, lastname: string, password: string, families: string, requestPassword: string}) {
        const {email,firstname,lastname,password,families,requestPassword} = args;
        await CreateUserService.createUser(
            email,
            firstname,
            lastname,
            password,
            families == undefined ? null : families,
            requestPassword == undefined ? null : requestPassword
        );
    }

    static help() {
        console.log("Exemple : node bin/console.js "+this.commandName+" -e|--email adresseMail -f|--firstname prenom -l|--lastname nom -p|--password motDePasse [--families|-fa \"famille1, famille2, famille3\"] [--request-password http://adresseExterneDuServeur]")
    }
}
