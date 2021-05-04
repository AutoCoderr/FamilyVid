import User from "../Entities/User";
import {Mailer} from "../Core/Mailer";
import Helpers from "../Core/Helpers";
import Confirmation from "../Entities/Confirmation";

export default class MailService {

    static async sendPasswordChangeMail(user: User,proto,host) {
        const confirmation = new Confirmation();
        confirmation.setToken(Helpers.generateRandomString(20, ["/","&","?","#","%"]));
        confirmation.setUser(user);
        confirmation.setType("password");

        const mailer = new Mailer();
        mailer.addDestinations(<string>user.getEmail());
        mailer.setSubject("FamilyVid - Changer de mot de passe");
        mailer.setMessage("Bonjour "+user.getFirstname()+" "+user.getLastname()+"<br/>"+
                          "Vous pouvez définir votre nouveau mot de passe <a href='"+proto+"://"+host+Helpers.getPath("security_new_password", {token: confirmation.getToken()})+"'>ICI</a><br/>"+
                          "Vous pouvez accéder au site <a href='"+proto+"://"+host+Helpers.getPath("index")+"'>ICI</a>");

        if (await mailer.send()) {
            await confirmation.save();
            return true;
        }
        return false;
    }

    static async sendConfirmationMail(user: User,proto,host) {
        const confirmation = new Confirmation();
        confirmation.setToken(Helpers.generateRandomString(20, ["/","&","?","#","%"]));
        confirmation.setUser(user);
        confirmation.setType("account");

        const mailer = new Mailer();
        mailer.addDestinations(<string>user.getEmail());
        mailer.setSubject("FamilyVid - Bienvenue "+user.getFirstname()+" "+user.getLastname()+" !");
        mailer.setMessage("Votre compte au nom de '"+user.getFirstname()+" "+user.getLastname()+"' a été créé avec succès!<br/>"+
                          "Il ne vous reste plus qu'à le valider <a href=\""+proto+"://"+host+Helpers.getPath("security_confirm_account", {token: confirmation.getToken()})+"\">ICI</a>");

        if (await mailer.send()) {
            await confirmation.save();
            return true;
        }
        return false;
    }
}
