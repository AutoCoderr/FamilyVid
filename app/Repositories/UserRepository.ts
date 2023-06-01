import {Op} from "sequelize";

import UserModel from "../Models/User";
import User from "../Entities/User";
import RepositoryManager from "../Core/RepositoryManager";
import Helpers from "../Core/Helpers";
import FamilyModel from "../Models/Family";
import MediaModel from "../Models/Media";
import SectionModel from "../Models/Section";

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

    static findAllByEmailAndActiveOrNot(email,active: null|boolean = null) {
        return super.findAllByParams({
            where: {
                email,
                ...(active != null ? {active} : {})
            }
        })
    }

    static findAllBySearch(search = '') {
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

    static findOneWithSectionsAndMedias(id) {
        return super.findOne(id,[
            {
                model: FamilyModel,
                include: [
                    {
                        model: SectionModel,
                        include: [{model: MediaModel, as: "Medias"}]
                    }]
            }]
        );
    }

    static findOne(id) {
        return super.findOne(id,FamilyModel);
    }
}
