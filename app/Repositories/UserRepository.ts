import UserModel from "../Models/User";
import User from "../Entities/User";
import RepositoryManager from "../Core/RepositoryManager";
import Helpers from "../Core/Helpers";
import FamilyModel from "../Models/Family";
import MediaModel from "../Models/Media";
import SectionModel from "../Models/Section";
import {sequelize} from "../Core/DB";
const {DB_PREFIX} = require("../Core/env.js");

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

    static async findAllVisibleUsersBySearchAndFamily(search: string = "", familyId: number, familyIdsWhereUserIsMember: Array<number>, userIsMember: null|boolean = null) {
        if (userIsMember == null)
            userIsMember = familyIdsWhereUserIsMember.includes(familyId);
        return (await sequelize.query("SELECT U.id, U.firstname, U.lastname, U.email, (\n"+
            "SELECT count(F2.id) from "+DB_PREFIX+"family F2\n"+
            "inner join \""+DB_PREFIX+"User_Families\" UF2 on F2.id = UF2.\"FamilyId\"\n"+
            "where UF2.\"UserId\" = U.id and ("+(familyIdsWhereUserIsMember.length > 0 ? "F2.id IN ("+familyIdsWhereUserIsMember.join(",")+") or " : "")+"UF2.visible = true)) as nbFamilies " +

            "from "+DB_PREFIX+"user U\n" +
            "    inner join \""+DB_PREFIX+"User_Families\" UF on UF.\"UserId\" = U.id\n" +
            "where UF.\"FamilyId\" = "+familyId+" AND " + (!userIsMember ? "UF.visible = true AND \n" : "\n") +
            (search != "" ?
                "(UNACCENT(LOWER(U.firstname)) like UNACCENT(LOWER('%"+search+"%')) OR \n"+
                "UNACCENT(LOWER(U.lastname)) like UNACCENT(LOWER('%"+search+"%')) OR \n"+
                "UNACCENT(LOWER(U.email)) like UNACCENT(LOWER('%"+search+"%'))) \n"
                : "1=1 \n") +
            "order by U.email"))[0];
    }

    static findOne(id) {
        return super.findOne(id,FamilyModel);
    }
}
