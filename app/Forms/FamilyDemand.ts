import Helpers from "../Core/Helpers";
import User from "../Entities/User";
import Family from "../Entities/Family";
import FamilyDemandEntity from "../Entities/FamilyDemand";
import FamilyDemandRepository from "../Repositories/FamilyDemandRepository";

export default function FamilyDemand(applicantId: number, userId: null|number = null,familyId: null|number = null) {
    return {
        config: {
            action: Helpers.getPath("family_demand"),
            method: "POST",
            submit: "Demander",
            actionName: "family_demand",
            msgError: "Echec de l'envoie de la demande",
            formClass: "form-btn",
            submitClass: "btn",
            entity: FamilyDemandEntity
        },
        fields: {
            visible: {
                type: "checkbox",
                label: "Visible pour les autres",
                required: false,
                value: false
            },
            family: {
                type: "hidden",
                value: familyId,
                entity: Family,
                required: true,
                msgError: "Cette famille n'existe pas"
            },
            user: {
                type: "hidden",
                value: userId,
                entity: User,
                required: true,
                msgError: "Cet utilisateur n'existe pas",
                valid: (user: User,datas) =>
                    (<Array<Family>>user.getFamilies()).find(family => family.getId() == datas.family.getId() && family.getVisible()) == undefined ?
                        "L'utilisateur "+user.getFirstname()+" "+user.getLastname()+" n'apparait pas comme étant dans la famille "+datas.family.getName() :
                        true
            },
            applicant: {
                depend_on: ["user","family"],
                value: applicantId,
                entity: User,
                type: "param",
                required: true,
                valid: async (applicant: User,datas) =>
                    (<Array<Family>>applicant.getFamilies()).find(family => family.getId() == datas.family.getId()) != undefined ?
                        "Vous vous trouvez déjà dans la famille " + datas.family.getName() :

                        await FamilyDemandRepository.findOneByApplicantIdUserIdAndFamilyId(applicant.getId(),datas.user.getId(),datas.family.getId()) != null ?
                            "Vous avez déjà demandé à "+datas.user.getFirstname()+" "+datas.user.getLastname()+" de vous faire rentrer dans la famille "+datas.family.getName() :
                            true
            }
        }
    }
};
