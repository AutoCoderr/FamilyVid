import User from "../Entities/User";
import Controller from "../Core/Controller";
import Register from "../Forms/Register";
import Validator from "../Core/Validator";
import Login from "../Forms/Login";
import UserRepository from "../Repositories/UserRepository";

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

                await user.save();
                this.loginAndRedirect(user);
            } else {
                this.redirectToRoute("security_register");
            }
            return;
        }

        this.render("security/register.html.twig", {formRegister});
    }

    login = async () => {
        const formLogin = Login();
        const validator = new Validator(this.req,formLogin);

        if (validator.isSubmitted()) {
            if (await validator.isValid()) {
                const datas = this.getDatas();

                const user: User = await UserRepository.findOneByEmailAndPassword(datas.email,datas.password);
                if (user == null) {
                    if(typeof(this.req.session.errors) == "undefined") {
                        this.req.session.errors = {};
                    }
                    this.req.session.errors[formLogin.config.actionName] = [formLogin.config.msgError];
                    this.redirectToRoute("security_login");
                } else {
                    this.loginAndRedirect(user);
                }
            } else {
                this.redirectToRoute("security_login");
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
        this.req.session.user = await user.serialize();
        this.redirectToRoute("index");
    }
}

function rand(a,b) {
    return a+Math.floor(Math.random()*(b-a+1));
}
