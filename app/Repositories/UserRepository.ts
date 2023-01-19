import UserModel from "../Models/User";
import ExemplaireModel from "../Models/Exemplaire";
import User from "../Entities/User";
import RepositoryManager from "../Core/RepositoryManager";
import Helpers from "../Core/Helpers";

export default class UserRepository extends RepositoryManager {
    static model = UserModel;
    static entity = User;

    static async findOneByEmailAndPassword(email,password) {
        return await super.findOneByParams({where: {email, password: Helpers.hashPassword(password)}});
    }

    static async findOne(id) {
        return await super.findOne(id,ExemplaireModel);
    }
}
