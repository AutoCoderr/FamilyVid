import Controller from "../Core/Controller";
import UserRepository from "../Repositories/UserRepository";
import Helpers from "../Core/Helpers";
import FamilyDemandRepository from "../Repositories/FamilyDemandRepository";
import User from "../Entities/User";
import ChangeUserInfos from "../Forms/ChangeUserInfos";
import Validator from "../Core/Validator";
import ChangeUserPassword from "../Forms/ChangeUserPassword";

export default class UserController extends Controller {
    all = async () => {
        let users = await UserRepository.findAllBySearchExceptOne(this.req.session.user.id);

        users = await Helpers.serializeEntityArray(users);

        users = users.map(user => {
          return {...user, Families: user.Families.filter((family) => family.visible)};
        });

        this.render("user/all.html.twig", {users});
    }

    me = async () => {
        const user = await <Promise<User>>this.getUser();
        this.req.session.user = await user.serialize();
        let demands = await FamilyDemandRepository.findByUserId(this.req.session.user.id,false);

        const userInfosForm = ChangeUserInfos();
        const userInfosValidator = new Validator(this.req,userInfosForm);
        if (userInfosValidator.isSubmitted()) {
            if (await userInfosValidator.isValid()) {
                const datas = this.getDatas();
                user.setFirstname(datas.firstname);
                user.setLastname(datas.lastname);

                await user.save();
                this.setFlash("me_success", "Informations modifiées avec succès!");
            }

            this.redirect(this.req.header('Referer'));
            return;
        }

        const userPasswordForm = ChangeUserPassword();
        const userPasswordValidator = new Validator(this.req,userPasswordForm);
        if (userPasswordValidator.isSubmitted()) {
            if (await userPasswordValidator.isValid()) {
                const datas = this.getDatas();
                if (Helpers.hashPassword(datas.old_password) != user.getPassword()) {
                    userPasswordValidator.setFlashErrors([userPasswordForm.fields.old_password.msgError]);
                    this.redirect(this.req.header('Referer'));
                    return;
                }
                user.setPassword(datas.password);

                await user.save();
                this.setFlash("me_success", "Mot de passe modifié avec succès!");
            }
            this.redirect(this.req.header('Referer'));
            return;
        }
        this.generateToken();
        Helpers.hydrateForm(user,userInfosForm);
        this.render("user/me.html.twig", {demands,userInfosForm,userPasswordForm});
    }

    search = async () => {
        const {search} = this.req.body;
        let users: any = await UserRepository.findAllBySearchExceptOne(this.req.session.user.id, search);
        users = await Helpers.serializeEntityArray(users);
        users = users.map(user => {
           return {
               id: user.id,
               firstname: user.firstname,
               lastname: user.lastname,
               email: user.email,
               nbFamily: user.Families.filter(family => family.visible).length}
        });
        this.res.json(users);
    }
}
