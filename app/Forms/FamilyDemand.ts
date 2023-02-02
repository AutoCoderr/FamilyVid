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
            msgError: "Echec de l'envoie de la demande",
            formClass: "form-btn",
            submitClass: "btn"
        },
        fields: {
            visible: {
                type: "checkbox",
                label: "Visible pour les autres",
                required: false,
                value: false
            },
            user: {
                type: "hidden",
                value: userId,
                entity: User.name,
                msgError: "Cet utilisateur n'existe pas"
            },
            family: {
                type: "hidden",
                value: familyId,
                entity: Family.name,
                msgError: "Cette famille n'existe pas"
            }
        }
    }
};
