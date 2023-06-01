import Section from "../Entities/Section";
import RepositoryManager from "../Core/RepositoryManager";
import FamilyModel from "../Models/Family";
import SectionModel from "../Models/Section";
import MediaModel from "../Models/Media";
import {col, fn, Op} from "sequelize";

export default class SectionRepository extends RepositoryManager {
    static model = SectionModel;
    static entity = Section;

    static findOne(id) {
        return super.findOne(id,[
            FamilyModel,
            {model: MediaModel, as: "Medias"}
        ], [
            [{model: MediaModel, as: "Medias"}, 'date', 'DESC'],
            [{model: MediaModel, as: "Medias"}, 'id', 'ASC']
        ]);
    }

    static findOneBySlug(slug) {
        return super.findOneByParams({
            where: {slug: slug},
            include: [
                FamilyModel,
                {model: MediaModel, as: "Medias"}
            ],
            order: [
                [{model: MediaModel, as: "Medias"}, 'date', 'DESC'],
                [{model: MediaModel, as: "Medias"}, 'id', 'ASC']
            ]
        })
    }

    static findAllByFamilyId(familyIds: number|Array<number>) {
        if (typeof(familyIds) == "number") {
            familyIds = [familyIds];
        }
        return super.findAllByParams({
            where: {
                FamilyId: { [Op.in]: familyIds }
            },
            include: FamilyModel
        });
    }

    static findAllByFamilyIdExceptOne(familyId,sectionId) {
        return super.findAllByParams({
           where: {
               FamilyId: familyId,
               id: { [Op.ne]: sectionId }
           }
        });
    }

    static findAllByFamilyAndSearch(familyId,search) {
        search = "%"+search+"%";
        return super.findAllByParams({
            where: {
               name: {[Op.iLike]: search},
               FamilyId: familyId
            },
            order: [fn('lower', col("name"))],
        });
    }
}
