import Helpers from "../Core/Helpers";
import Family from "../Entities/Family";
import SectionEntity from "../Entities/Section";

export default function Section(family: Family, section: null|SectionEntity = null) {
    return {
        config: {
            action:  section == null ? Helpers.getPath("section_new", {familySlug: family.getSlug()}) : Helpers.getPath("section_edit", {familySlug: family.getSlug(),sectionSlug: section.getSlug()}),
            method: "POST",
            submit: section == null ? "Créer" : "Modifier",
            actionName: section == null ? "section_create" : "section_edit",
            msgError: "Echec de "+(section == null ? "la création" : "l'édition")+" de la rubrique",
            formClass: "form-btn",
            submitClass: "btn",
            entity: SectionEntity,
            ...(section != null ? {entityInstance: section} : {})
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
            },
            ...(section == null ?
                {
                    family: {
                        type: "param",
                        value: family,
                        entity: Family,
                        required: true
                    }
                } : {})
        }
    }
};
