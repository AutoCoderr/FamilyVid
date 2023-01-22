import Helpers from "../Core/Helpers";
import User from "../Entities/User";
import Family from "../Entities/Family";

export default function FamilyDemand(userId,familyId) {
    return {
        config: {
            action: Helpers.getPath("family_demand"),
            method: "POST",
            submit: "Demander",
            actionName: "family_demand",
            msgError: "Echec de l'envoie de la demande"
        },
        fields: {
            visible: {
                type: "checkbox",
                label: "Visible pour les autres",
                required: false,
                default: false
            },
            user: {
                type: "hidden",
                default: userId,
                entity: User.name,
                msgError: "Cet utilisateur n'existe pas"
            },
            family: {
                type: "hidden",
                default: familyId,
                entity: Family.name,
                msgError: "Cette famille n'existe pas"
            }
        }
    }
};
