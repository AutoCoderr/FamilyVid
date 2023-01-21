import Controller from "../Core/Controller";
import UserRepository from "../Repositories/UserRepository";
import Helpers from "../Core/Helpers";
import FamilyDemandRepository from "../Repositories/FamilyDemandRepository";

export default class UserController extends Controller {
    all = async () => {
        let users = await UserRepository.findAllExceptOne(this.req.session.user.id);

        users = await Helpers.serializeEntityArray(users);

        users = users.map(user => {
          return {...user, Families: user.Families.filter((family) => family.visible)};
        });

        this.render("user/all.html.twig", {users});
    }

    me = async () => {
        let demands = await FamilyDemandRepository.findByUserId(this.req.session.user.id,false);

        this.render("user/me.html.twig", {demands});
    }


}
