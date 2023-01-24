import Helpers from "../Core/Helpers";

export default function Section(familyId) {
    return {
        config: {
            action: Helpers.getPath("section_new", {familyId}),
            method: "POST",
            submit: "Créer",
            actionName: "section_create",
            msgError: "Echec de la création de la rubrique"
        },
        fields: {
            name: {
                type: "text",
                label: "Le nom de la rubrique",
                required: true,
                maxLength: 50,
                minLength: 2,
                msgError: "Le nom doit être compris entre 2 et 50 caractères",
                uniq: {
                    table: "Section",
                    column: "name",
                    msgError: "Une rubrique porte déjà ce nom dans cette famille",
                    where: { FamilyId: familyId }
                }
            }
        }
    }
};
