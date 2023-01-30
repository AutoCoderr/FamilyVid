import Controller from "../Core/Controller";
import UserRepository from "../Repositories/UserRepository";
import Helpers from "../Core/Helpers";
import FamilyDemandRepository from "../Repositories/FamilyDemandRepository";
import User from "../Entities/User";

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
        this.req.session.user = await (await <Promise<User>>this.getUser()).serialize();
        let demands = await FamilyDemandRepository.findByUserId(this.req.session.user.id,false);

        this.render("user/me.html.twig", {demands});
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
