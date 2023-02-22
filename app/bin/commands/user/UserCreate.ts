import Command from "../../../Core/Command";
import User from "../../../Entities/User";
import UserRepository from "../../../Repositories/UserRepository";

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
        const {email,firstname,lastname,password} = args;
        const foundUsers: Array<User> = await UserRepository.findAllByEmailAndActiveOrNot(email);
        if (foundUsers.find(user => user.getActive())) {
            console.log("Un utilisateur avec l'adresse mail '"+email+"' existe déjà");
            return;
        }

        await Promise.all(
            foundUsers.map(user => user.delete())
        );

        const newUser = new User();
        newUser.setEmail(email);
        newUser.setFirstname(firstname);
        newUser.setLastname(lastname);
        newUser.setPassword(password);
        newUser.setActive(true);
        newUser.addRole("USER");

        await newUser.save();

        console.log("Utilisateur créé avec succès!");
    }

    static help() {
        console.log("Exemple : node bin/console.js "+this.commandName+" -e|--email adresseMail -f|--firstname prenom -l|--lastname nom -p|--password motDePasse [-t|--test  unNombre]")
    }
}
