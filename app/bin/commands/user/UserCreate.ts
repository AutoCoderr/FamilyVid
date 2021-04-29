import Command from "../../../Core/Command";
import User from "../../../Entities/User";
import UserRepository from "../../../Repositories/UserRepository";
import FamilyRepository from "../../../Repositories/FamilyRepository";
import Family from "../../../Entities/Family";
import MailService from "../../../Services/MailService";

export default class UserCreate extends Command {
    static commandName = "user:create";

    static argsModel = {
        email: {fields: ["--email","-e"], type:"string", description: "L'adresse mail"},
        firstname: {fields: ["--firstname", "-f"], type: "string", description: "Le prénom"},
        lastname: {fields: ["--lastname", "-l"], type: "string", description: "Le nom"},
        password: {fields: ["--password", "-p"], type: "string", description: "Le mot de passe"},
        families: {fields: ["--families", "-fa"], type: "string", description: "Les familles de l'utilisateur", required: false},
        requestPassword: {fields: ["--request-password"], type: "string", description: "Pour envoyer un mail de réinitialisation de mot de passe, nécessite de spécifier l'adresse externe du serveur", require: false}
    };

    static async action(args: {email: string, firstname: string, lastname: string, password: string, families: string, requestPassword: string}) {
        const {email,firstname,lastname,password,families,requestPassword} = args;
        const foundUsers: Array<User> = await UserRepository.findAllByEmailAndActiveOrNot(email);
        if (foundUsers.find(user => user.getActive())) {
            console.log("Un utilisateur avec l'adresse mail '"+email+"' existe déjà");
            return;
        }
        let familiesList: Array<Family> = [];
        if (families != undefined) {

            const familyNames =  families
                .split(",")
                .map(family => family.trim());

            familiesList = await Promise.all(
                familyNames
                    .map(familyName => FamilyRepository.findOneByName(familyName))
            );

            let unknownFamilies = false;
            for (let i=0;i<familiesList.length;i++) {
                const family = familiesList[i];
                if (family == null) {
                    console.log("Famille '"+familyNames[i]+"' inexistante");
                    unknownFamilies = true;
                }
            }
            if (unknownFamilies) return;
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

        await Promise.all(
            familiesList.map(family => family.addUser(newUser))
        )

        if (requestPassword != undefined) {
            const splittedRequestPassword = requestPassword.split("://")
            if (splittedRequestPassword.length != 2 || (splittedRequestPassword[0] != "http" && splittedRequestPassword[0] != "https")) {
                console.log("Vous devez spécifier '--request-password [http://address ou https://address]'");
                return;
            }
            const proto = splittedRequestPassword[0];
            const address = splittedRequestPassword[1];
            if (!await MailService.sendPasswordChangeMail(newUser,proto,address)) {
                console.log("Utilisateur créé");
                console.log("Mais le mail de changement de mot de passe n'a pas pus être envoyé");
                return;
            }
        }

        console.log("Utilisateur créé avec succès!");
    }

    static help() {
        console.log("Exemple : node bin/console.js "+this.commandName+" -e|--email adresseMail -f|--firstname prenom -l|--lastname nom -p|--password motDePasse [--families|-fa \"famille1, famille2, famille3\"] [--request-password http://adresseExterneDuServeur]")
    }
}
