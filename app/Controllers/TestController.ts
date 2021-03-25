import User from "../Entities/User";
import Produit from "../Entities/Produit";
import Exemplaire from "../Entities/Exemplaire";
import ExemplaireRepository from "../Repositories/ExemplaireRepository";
import Controller from "../Core/Controller";
import Register from "../Forms/Register";
import Validator from "../Core/Validator";
import Login from "../Forms/Login";
import UserRepository from "../Repositories/UserRepository";

export default class TestController extends Controller {

    getExemplaires = async () => {
        let produits: Array<{name: string, entity: any}> = [
            {name: "Rubik's cube", entity: null},
            {name: "PC gamer", entity: null},
            {name: "Iphone 18", entity: null},
            {name: "Machine à café", entity: null}]

        for (let produit of produits) {
            produit.entity = new Produit();
            produit.entity.setName(produit.name);
            produit.entity.setUnits(rand(1,15));
            await produit.entity.save();

            console.log("produit => ");
            console.log(produit.entity);
        }

        let user = await this.getUser();
        for (let produit of produits) {
            let exemplaire = new Exemplaire();
            exemplaire.setProduit(produit.entity);
            exemplaire.setUser(user);
            exemplaire.setUnits(rand(1,5));

            await exemplaire.save();
        }

        //let newUser: User = await UserRepository.findOne(user.getId());
        const exemplaires = await ExemplaireRepository.findByUserId(user.id);
        console.log(exemplaires);

        this.render("test/exemplaires.html.twig", {
            exemplaires
        });
    }

    coucou = async () => {
        const prenom = this.req.params.prenom
        this.render("test/coucou.html.twig", {prenom});
    }

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
                this.redirectToRoute("test_register");
            }
            return;
        }

        this.render("test/register.html.twig", {formRegister});
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
                    this.redirectToRoute("test_login");
                } else {
                    this.loginAndRedirect(user);
                }
            } else {
                this.redirectToRoute("test_login");
            }
            return;
        }

        this.render("test/login.html.twig", {formLogin});
    }

    logout = async () => {
        delete this.req.session.user;
        this.redirectToRoute("test_coucou", {prenom: "toto"});
    }

    async loginAndRedirect(user: User) {
        this.req.session.user = await user.serialize();
        this.redirectToRoute("test_coucou", {prenom: "toto"});
    }
}

function rand(a,b) {
    return a+Math.floor(Math.random()*(b-a+1));
}
