import Helpers from "../Core/Helpers";
import Family from "../Entities/Family";

export default function FamilyChangeDisplay(family: Family) {
    return {
        config: {
            action: Helpers.getPath("family_change_display", {slug: family.getSlug()}),
            method: "POST",
            submit: "Valider",
            actionName: "family_change_display",
            msgError: "Echec de la modification",
            formClass: "form-btn",
            submitClass: "btn",
            entity: Family,
            entityInstance: family
        },
        fields: {
            visible: {
                type: "checkbox",
                label: "Visible pour les autres",
            }
        }
    }
};
