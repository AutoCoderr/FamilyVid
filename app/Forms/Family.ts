import Helpers from "../Core/Helpers";

export default function Family() {
    return {
        config: {
            action: Helpers.getPath("family_new"),
            method: "POST",
            submit: "Créer",
            actionName: "family_create",
            msgError: "Echec de la création de famille"
        },
        fields: {
            name: {
                type: "text",
                label: "Le nom de la famille",
                required: true,
                maxLength: 50,
                minLength: 2,
                msgError: "Le nom doit être compris entre 2 et 50 caractères"
            },
            visible: {
                type: "checkbox",
                label: "Visible pour les autres",
                required: false,
                default: false
            }
        }
    }
};
