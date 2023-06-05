import User from "../Entities/User";
import Controller from "../Core/Controller";
import Register from "../Forms/Register";
import Validator from "../Core/Validator";
import Login from "../Forms/Login";
import UserRepository from "../Repositories/UserRepository";
import MailService from "../Services/MailService";
import ConfirmationRepository from "../Repositories/ConfirmationRepository";
import Confirmation from "../Entities/Confirmation";
import ForgotPassword from "../Forms/ForgotPassword";
import Helpers from "../Core/Helpers";
import ChangeUserPassword from "../Forms/ChangeUserPassword";

export default class SecurityController extends Controller {

    register = async () => {
        const formRegister = Register();
        const validator = new Validator(this.req,formRegister);

        if (validator.isSubmitted()) {
            if (await validator.isValid()) {

                await validator.save();
                const user = <User>validator.entity

                if (!await MailService.sendConfirmationMail(user,this.req.protocol,this.req.headers.host)) {
                    await user.delete();
                    console.log("Cannot send mail to "+user.getEmail());
                    validator.setFlashErrors("Nous n'avons pas pus envoyer de mail de confirmation vers "+user.getEmail());
                    this.redirect(this.req.header('Referer'));
                    return;
                }
                this.render("security/need_confirmation.html.twig");
            } else {
                this.redirect(this.req.header('Referer'));
            }
            return;
        }

        this.render("security/register.html.twig", {formRegister});
    }

    confirm_account = async () => {
        const {token} = this.req.params;
        const confirmation: Confirmation = await ConfirmationRepository.findOneByTokenForAccount(token);
        if (confirmation == null) {
            this.setFlash("failed", "Confirmation échouée");
            this.redirectToRoute("index");
            return;
        }
        const user = <User>confirmation.getUser();
        user.setActive(true);
        await user.save();

        await confirmation.delete();

        const otherUsers: Array<User> = await UserRepository.findAllByEmailAndActiveOrNot(user.getEmail(),false);
        for (const anotherUser of otherUsers) {
            await anotherUser.delete();
        }

        this.render("security/account_confirmation.html.twig", {user});
    }

    login = async () => {
        const formLogin = Login();
        const validator = new Validator(this.req,formLogin);

        if (validator.isSubmitted()) {
            if (await validator.isValid()) {
                const datas = this.getDatas();

                const user: User = await UserRepository.findOneByEmailAndPassword(datas.email,datas.password);
                if (user == null) {
                    validator.setFlashErrors(formLogin.config.msgError)
                    this.redirect(this.req.header('Referer'));
                } else {
                    if (!user.getActive()) {
                        validator.setFlashErrors("Vous devez valider le mail de confirmation");
                        this.redirect(this.req.header('Referer'));
                        return;
                    }
                    this.loginAndRedirect(user);
                }
            } else {
                this.redirect(this.req.header('Referer'));
            }
            return;
        }

        this.render("security/login.html.twig", {formLogin});
    }

    forgot_password = async () => {
        const forgotPasswordForm = ForgotPassword();
        const validator = new Validator(this.req,forgotPasswordForm);

        if (validator.isSubmitted()) {
            if (await validator.isValid()) {
                const datas = validator.getDatas();

                const user: User = await UserRepository.findOneByEmailAndActive(datas.email);
                if (user == null) {
                    validator.setFlashErrors("Aucun utilisateur ne correspond à cette adresse mail");
                    this.redirect(this.req.header('Referer'));
                    return;
                }

                if (!await MailService.sendPasswordChangeMail(user,this.req.protocol,this.req.headers.host)) {
                    validator.setFlashErrors("Envoie du mail contenant le lien de changement de mot de passe échoué");
                    this.redirect(this.req.header('Referer'));
                    return;
                }

                this.setFlash("forgot_password_success", "Le lien de changement de mot de passe vous a été envoyé par mail!");
            }
            this.redirect(this.req.header('Referer'));
            return;
        }

        this.render("security/forgot_password.html.twig", {forgotPasswordForm});
    }

    new_password = async () => {
        const {token} = this.req.params;

        const confirmation: Confirmation = await ConfirmationRepository.findOneByTokenForPassword(token);
        if (confirmation == null) {
            this.setFlash("failed", "Vous ne pouvez pas changer votre mot de passe ici");
            this.redirectToRoute("index");
            return;
        }
        const changeUserPasswordForm = ChangeUserPassword(token);
        const changeUserPasswordValidator = new Validator(this.req,changeUserPasswordForm);
        if (changeUserPasswordValidator.isSubmitted()) {
            if (await changeUserPasswordValidator.isValid()) {
                const datas = this.getDatas();
                const user: User = <User>confirmation.getUser();
                user.setPassword(datas.password);
                await user.save();
                await confirmation.delete();

                this.setFlash("success", "Votre mot de passe a été changé avec succès! Vous pouvez vous connecter");
                this.redirectToRoute("index");
            } else {
                this.redirect(this.req.header('Referer'));
            }
            return;
        }
        this.render("security/new_password.html.twig", {changeUserPasswordForm})
    }

    logout = async () => {
        delete this.req.session.user;
        this.redirectToRoute("index");
    }

    async loginAndRedirect(user: User) {
        this.generateToken();
        this.req.session.user = await user.serialize();
        this.redirectToRoute("index");
    }
}

function rand(a,b) {
    return a+Math.floor(Math.random()*(b-a+1));
}
