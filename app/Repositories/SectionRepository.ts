import Section from "../Entities/Section";
import RepositoryManager from "../Core/RepositoryManager";
import FamilyModel from "../Models/Family";
import SectionModel from "../Models/Section";
import MediaModel from "../Models/Media";

export default class SectionRepository extends RepositoryManager {
    static model = SectionModel;
    static entity = Section;

    static findOne(id) {
        return super.findOne(id,[
            FamilyModel,
            {model: MediaModel, as: "Medias"}
        ]);
    }
}
