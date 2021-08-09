import Helpers from "../Core/Helpers";
import FamilyEntity from "../Entities/Family";

export default function Family() {
    return {
        config: {
            action: Helpers.getPath("family_new"),
            method: "POST",
            submit: "Créer",
            actionName: "family_create",
            msgError: "Echec de la création de famille",
            formClass: "form-btn",
            submitClass: "btn",
            entity: FamilyEntity
        },
        fields: {
            name: {
                type: "text",
                label: "Le nom de la famille",
                required: true,
                maxLength: 50,
                minLength: 2,
                msgError: "Le nom doit être compris entre 2 et 50 caractères",
                uniq: {table: "Family", column: "name", msgError: "Une famille porte déjà ce nom"}
            },
            visible: {
                type: "checkbox",
                label: "Visible pour les autres",
                required: false,
                value: false
            }
        }
    }
};
