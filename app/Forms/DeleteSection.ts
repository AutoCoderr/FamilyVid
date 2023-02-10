import Helpers from "../Core/Helpers";

export default function DeleteSection(familySlug,sectionSlug) {
    return {
        config: {
            action: Helpers.getPath("section_delete", {familySlug,sectionSlug}),
            method: "POST",
            submit: "Supprimer",
            actionName: "delete_section",
            msgError: "Suppression échouée",
            confirmOnSubmit: "Êtes vous sûre de vouloir supprimer cette rubrique? Il n'y a pas de corbeille",
            formClass: "form-btn",
            submitClass: "btn"
        },
        fields: {
        }
    }
}
