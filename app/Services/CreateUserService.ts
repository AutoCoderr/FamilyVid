import User from "../Entities/User";
import UserRepository from "../Repositories/UserRepository";
import Family from "../Entities/Family";
import FamilyRepository from "../Repositories/FamilyRepository";
import MailService from "./MailService";

export default class CreateUserService {
    static async createUser(email: string, firstname: string, lastname: string, password: string, families: null|string = null, requestPassword: null|string = null) {
        const foundUsers: Array<User> = await UserRepository.findAllByEmailAndActiveOrNot(email);
        if (foundUsers.find(user => user.getActive())) {
            console.log("Un utilisateur avec l'adresse mail '"+email+"' existe déjà");
            return false;
        }
        let familiesList: Array<Family> = [];
        if (families != null) {

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
            if (unknownFamilies) return false;
        }

        if (requestPassword != null) {
            const splittedRequestPassword = requestPassword.split("://")
            if (splittedRequestPassword.length != 2 || (splittedRequestPassword[0] != "http" && splittedRequestPassword[0] != "https")) {
                console.log("Vous devez spécifier '--request-password [http://address ou https://address]'");
                return false;
            }
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

        if (requestPassword != null) {
            const splittedRequestPassword = requestPassword.split("://")
            const proto = splittedRequestPassword[0];
            const address = splittedRequestPassword[1];
            if (!await MailService.sendPasswordChangeMail(newUser,proto,address)) {
                console.log("Utilisateur créé");
                console.log("Mais le mail de changement de mot de passe n'a pas pus être envoyé");
                return false;
            }
        }

        console.log("Utilisateur créé avec succès!");
        return true;
    }
}
