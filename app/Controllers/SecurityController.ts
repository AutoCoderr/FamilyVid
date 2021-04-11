import User from "../Entities/User";
import Controller from "../Core/Controller";
import Register from "../Forms/Register";
import Validator from "../Core/Validator";
import Login from "../Forms/Login";
import UserRepository from "../Repositories/UserRepository";
import ConfirmationAccountService from "../Services/ConfirmationAccountService";
import AccountConfirmationRepository from "../Repositories/AccountConfirmationRepository";
import AccountConfirmation from "../Entities/AccountConfirmation";

export default class SecurityController extends Controller {

    register = async () => {
        const formRegister = Register();
        const validator = new Validator(this.req,formRegister);

        if (validator.isSubmitted()) {
            if (await validator.isValid()) {
                const datas = this.getDatas();

                let user = new User();
                user.setFirstname(datas.firstname);
                user.setLastname(datas.lastname);
                user.setEmail(datas.email);
                user.addRole('USER');
                user.setPassword(datas.password);
                user.setActive(false);
                await user.save();

                if (!await ConfirmationAccountService.sendConfirmationMail(user,this.req.protocol,this.req.headers.host)) {
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

    confirm = async () => {
        const {token} = this.req.params;
        const confirmation: AccountConfirmation = await AccountConfirmationRepository.findOneByToken(token);
        if (confirmation == null) {
            this.render("security/confirmation.html.twig", {success: false});
            return;
        }
        const user = <User>confirmation.getUser();
        user.setActive(true);
        await user.save();

        await confirmation.delete();

        const otherUsers: Array<User> = await UserRepository.findAllByEmailAndNotActive(user.getEmail());
        for (const anotherUser of otherUsers) {
            await anotherUser.delete();
        }

        this.render("security/confirmation.html.twig", {success: true, user});
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
