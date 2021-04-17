import Helpers from "../Core/Helpers";

export default function DeleteAllSectionMedias(familySlug, sectionSlug) {
    return {
        config: {
            action: Helpers.getPath("section_delete_with_media", {familySlug,sectionSlug}),
            method: "POST",
            submit: "Supprimer toutes les photos/vidéos",
            actionName: "delete_all_section_medias",
            msgError: "Suppression échouée",
            confirmOnSubmit: "Êtes vous sûre de vouloir supprimer toutes les photos/vidéos de cette rubrique? Il n'y a pas de corbeille",
            formClass: "form-btn",
            submitClass: "btn"
        },
        fields: {
        }
    }
}
