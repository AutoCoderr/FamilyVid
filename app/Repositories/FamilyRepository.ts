import UserModel from "../Models/User";
import Family from "../Entities/Family";
import RepositoryManager from "../Core/RepositoryManager";
import FamilyModel from "../Models/Family";
import SectionModel from "../Models/Section";
import {sequelize} from "../Core/DB";
const {DB_PREFIX} = require("../Core/env.js");

export default class FamilyRepository extends RepositoryManager {
    static model = FamilyModel;
    static entity = Family;

    static findOne(id) {
        return super.findOne(id,[UserModel,SectionModel]);
    }

    static findOneBySlug(slug, withUsers = false, withSections = false, withUsersFamilies = false) {
        return super.findOneByParams({
            where: { slug: slug },
            include: [
                ...(withUsers ? [
                    { model: UserModel, ...(withUsersFamilies ? {include: FamilyModel} : {}) }
                    ] : []),
                ...(withSections ? [SectionModel] : []),
            ]
        });
    }

    static async findAllWithVisibleUsers(search: string = "", familyIds: Array<number> = []) {
        return (await sequelize.query("SELECT F.id, F.name, F.slug, count(UF.\"UserId\") as nbmembers " +
            "from "+DB_PREFIX+"family F" +
            "    inner join \""+DB_PREFIX+"User_Families\" UF on UF.\"FamilyId\" = F.id " +
            "where ("+(familyIds.length > 0 ? "F.id IN ("+familyIds.join(",")+") OR " : "")+"UF.visible = true) AND " +
            (search != "" ?
                "UNACCENT(LOWER(F.name)) like UNACCENT(LOWER('%"+search+"%')) "
                : "1=1 ") +
            "group by F.id, F.name, F.slug " +
            "order by F.name " +
            "limit 20"))[0];
    }

    static findOneByName(name) {
        return super.findOneByParams({
            where: {name}
        })
    }

    static findAll() {
        return super.findAll(SectionModel);
    }

}
