import User from "../Entities/User";
import {Mailer} from "../Core/Mailer";
import Helpers from "../Core/Helpers";
import AccountConfirmation from "../Entities/AccountConfirmation";

export default class MailService {

    static async sendNewPasswordMail(user: User,newPassword: string) {
        const mailer = new Mailer();
        mailer.addDestinations(<string>user.getEmail());
        mailer.setSubject("FamilyVid - Votre nouveau mot de passe");
        mailer.setMessage("Bonjour "+user.getFirstname()+" "+user.getLastname()+"<br/>"+
                          "Voici votre nouveau mot de passe : <strong>"+newPassword+"</strong><br/>"+
                          "Nous vous encourageons à le modifier une fois connecté");
        return await mailer.send();
    }

    static async sendConfirmationMail(user: User,proto,host) {
        const confirmation = new AccountConfirmation();
        confirmation.setToken(Helpers.generateRandomString(20, ["/","&","?","#","%"]));
        confirmation.setUser(user);

        const mailer = new Mailer();
        mailer.addDestinations(<string>user.getEmail());
        mailer.setSubject("FamilyVid - Bienvenue "+user.getFirstname()+" "+user.getLastname()+" !");
        mailer.setMessage("Votre compte au nom de '"+user.getFirstname()+" "+user.getLastname()+"' a été créé avec succès!<br/>"+
                          "Il ne vous reste plus qu'à le valider <a href=\""+proto+"://"+host+Helpers.getPath("security_confirm", {token: confirmation.getToken()})+"\">ICI</a>");

        if (await mailer.send()) {
            await confirmation.save();
            return true;
        }
        return false;
    }
}