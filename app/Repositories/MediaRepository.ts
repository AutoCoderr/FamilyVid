import RepositoryManager from "../Core/RepositoryManager";
import SectionModel from "../Models/Section";
import MediaModel from "../Models/Media";
import Media from "../Entities/Media";

export default class MediaRepository extends RepositoryManager {
    static model = MediaModel;
    static entity = Media;

    static findOne(id) {
        return super.findOne(id,[SectionModel]);
    }
}
