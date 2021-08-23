import Controller from "../Core/Controller";
import UserRepository from "../Repositories/UserRepository";
import Helpers from "../Core/Helpers";
import FamilyDemandRepository from "../Repositories/FamilyDemandRepository";
import User from "../Entities/User";
import ChangeUserInfos from "../Forms/ChangeUserInfos";
import Validator from "../Core/Validator";
import ChangeUserPassword from "../Forms/ChangeUserPassword";

export default class UserController extends Controller {
    me = async () => {
        let demands = await FamilyDemandRepository.findByUserId(this.req.session.user.id,false);

        const userInfosForm = ChangeUserInfos(this.req.session.user.id);
        const userInfosValidator = new Validator(this.req,userInfosForm);
        if (userInfosValidator.isSubmitted()) {
            if (await userInfosValidator.isValid()) {
                await userInfosValidator.save();
                this.setFlash("me_success", "Informations modifiées avec succès!");
            }

            this.redirect(this.req.header('Referer'));
            return;
        }
        const user = await <Promise<User>>Helpers.getEntityFromForm(userInfosForm);

        const userPasswordForm = ChangeUserPassword();
        const userPasswordValidator = new Validator(this.req,userPasswordForm);
        if (userPasswordValidator.isSubmitted()) {
            if (await userPasswordValidator.isValid()) {
                const datas = this.getDatas();
                if (Helpers.hashPassword(datas.old_password) != user.getPassword()) {
                    userPasswordValidator.setFlashErrors([(<any>userPasswordForm.fields.old_password).msgError]);
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
}
