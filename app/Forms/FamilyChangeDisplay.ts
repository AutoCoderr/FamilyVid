import Helpers from "../Core/Helpers";
import User from "../Entities/User";
import Family from "../Entities/Family";

export default function FamilyChangeDisplay(familySlug) {
    return {
        config: {
            action: Helpers.getPath("family_change_display", {slug: familySlug}),
            method: "POST",
            submit: "Valider",
            actionName: "family_change_display",
            msgError: "Echec de la modification",
            formClass: "form-btn",
            submitClass: "btn"
        },
        fields: {
            visible: {
                type: "checkbox",
                label: "Visible pour les autres",
            }
        }
    }
};
