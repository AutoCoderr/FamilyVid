import UserModel from "../Models/User";
import Family from "../Entities/Family";
import RepositoryManager from "../Core/RepositoryManager";
import FamilyModel from "../Models/Family";

export default class FamilyRepository extends RepositoryManager {
    static model = FamilyModel;
    static entity = Family;

    static findOne(id) {
        return super.findOne(id,UserModel);
    }
}
