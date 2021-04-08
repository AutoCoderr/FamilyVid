import Helpers from "../Core/Helpers";

export default function DeleteSection(familyId,sectionId) {
    return {
        config: {
            action: Helpers.getPath("section_delete", {familyId,sectionId}),
            method: "POST",
            submit: "Supprimer",
            actionName: "delete_section",
            msgError: "Suppression échouée",
            confirmOnSumit: "Êtes vous sûre de vouloir supprimer cette rubrique? Il n'y a pas de corbeille",
            formClass: "form-btn",
            submitClass: "btn"
        },
        fields: {
        }
    }
}
