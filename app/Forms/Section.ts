import Helpers from "../Core/Helpers";
import Family from "../Entities/Family";

export default function Section(family: Family, sectionSlug = null) {
    return {
        config: {
            action:  sectionSlug == null ? Helpers.getPath("section_new", {familySlug: family.getSlug()}) : Helpers.getPath("section_edit", {familySlug: family.getSlug(),sectionSlug}),
            method: "POST",
            submit: sectionSlug == null ? "Créer" : "Modifier",
            actionName: sectionSlug == null ? "section_create" : "section_edit",
            msgError: "Echec de "+(sectionSlug == null ? "la création" : "l'édition")+" de la rubrique",
            formClass: "form-btn",
            submitClass: "btn"
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
                    where: { FamilyId: family.getId() }
                }
            }
        }
    }
};
