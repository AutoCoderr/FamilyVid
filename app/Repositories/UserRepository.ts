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

    static findAllBySearchExceptOne(id, search = '') {
        search = "%"+search+"%";
        return super.findAllByParams({
            where: {
                [Op.or]: [
                    {
                        firstname: { [Op.like]: search }
                    },
                    {
                        lastname: { [Op.like]: search }
                    },
                    {
                        email: { [Op.like]: search }
                    }
                ],
                id: {[Op.ne]: id}
            },
            order: ["email"],
            limit: 20,
            include: FamilyModel
        });
    }

    static findOne(id) {
        return super.findOne(id,FamilyModel);
    }
}
