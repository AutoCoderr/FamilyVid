import UserModel from "../Models/User";
import FamilyDemand from "../Entities/FamilyDemand";
import RepositoryManager from "../Core/RepositoryManager";
import FamilyDemandModel from "../Models/FamilyDemand";
import FamilyModel from "../Models/Family";

export default class FamilyDemandRepository extends RepositoryManager {
    static model = FamilyDemandModel;
    static entity = FamilyDemand;

    static findOne(id) {
        return super.findOne(id,[
            UserModel,
            FamilyModel,
            {
                model: UserModel, as: "Applicant"
            }
        ]);
    }

    static findOneByApplicantIdUserIdAndFamilyId(ApplicantId,UserId,FamilyId) {
        return super.findOneByParams({
            where: {
                ApplicantId,
                UserId,
                FamilyId
            }
        });
    }

    static findByUserId(UserId, eagerLoading = true) {
        return super.findAllByParams({
            where: {
                UserId,
            },
            include: [ ...( eagerLoading ? [
                UserModel,
                FamilyModel,
                {
                    model: UserModel, as: "Applicant"
                }] : [])
            ]
        });
    }
}
