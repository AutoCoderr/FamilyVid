import Helpers from "../Core/Helpers";

export default function Family(userId,familyId) {
    return {
        config: {
            action: Helpers.getPath("family_demand", {userId,familyId}),
            method: "POST",
            submit: "Demander",
            actionName: "family_demand_"+userId+"_"+familyId,
            msgError: "Echec de l'envoie de la demande"
        },
        fields: {
            visible: {
                type: "checkbox",
                label: "Visible pour les autres",
                required: false,
                default: false
            }
        }
    }
};
