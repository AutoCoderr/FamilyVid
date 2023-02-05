import UserModel from "../Models/User";
import RepositoryManager from "../Core/RepositoryManager";
import AccountConfirmationModel from "../Models/AccountConfirmation";
import AccountConfirmation from "../Entities/AccountConfirmation";

export default class AccountConfirmationRepository extends RepositoryManager {
    static model = AccountConfirmationModel;
    static entity = AccountConfirmation;

    static findOneByToken(token) {
        return super.findOneByParams({
            where: {
                token: token
            },
            include: UserModel
        });
    }
}
