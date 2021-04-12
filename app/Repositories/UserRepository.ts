import {Op} from "sequelize";

import UserModel from "../Models/User";
import User from "../Entities/User";
import RepositoryManager from "../Core/RepositoryManager";
import Helpers from "../Core/Helpers";
import FamilyModel from "../Models/Family";

export default class UserRepository extends RepositoryManager {
    static model = UserModel;
    static entity = User;

    static findOneByEmailAndPassword(email,password) {
        return super.findOneByParams({
            where: {
                email,
                password: Helpers.hashPassword(password)
            },
            include: FamilyModel
        });
    }

    static findAllByEmailAndNotActive(email) {
        return super.findAllByParams({
            where: {
                email,
                active: false
            }
        })
    }

    static findAllBySearchExceptOne(id, search = '') {
        search = "%"+search+"%";
        return super.findAllByParams({
            where: {
                [Op.or]: [
                    {
                        firstname: { [Op.iLike]: search }
                    },
                    {
                        lastname: { [Op.iLike]: search }
                    },
                    {
                        email: { [Op.iLike]: search }
                    }
                ],
                id: {[Op.ne]: id},
                active: true
            },
            order: ["email"],
            limit: 20,
            include: FamilyModel
        });
    }

    static findOneByEmailAndActive(email) {
        return super.findOneByParams({
            where: {
                email: email,
                active: true
            }
        })
    }

    static findOne(id) {
        return super.findOne(id,FamilyModel);
    }
}
