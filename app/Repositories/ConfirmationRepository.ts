import UserModel from "../Models/User";
import RepositoryManager from "../Core/RepositoryManager";
import AccountConfirmationModel from "../Models/Confirmation";
import Confirmation from "../Entities/Confirmation";

export default class ConfirmationRepository extends RepositoryManager {
    static model = AccountConfirmationModel;
    static entity = Confirmation;

    static findOneByTokenForAccount(token) {
        return super.findOneByParams({
            where: {
                token: token,
                type: "account"
            },
            include: UserModel
        });
    }

    static findOneByTokenForPassword(token) {
        return super.findOneByParams({
            where: {
                token: token,
                type: "password"
            },
            include: UserModel
        });
    }
}
