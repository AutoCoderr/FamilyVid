import Helpers from "../Core/Helpers";

export default function DeleteMedia(familySlug,sectionSlug,mediaSlug) {
    return {
        config: {
            action: Helpers.getPath("media_delete", {familySlug,sectionSlug,mediaSlug}),
            method: "POST",
            submit: "Supprimer",
            actionName: "delete_media",
            msgError: "Suppression échouée",
            confirmOnSumit: "Êtes vous sûre de vouloir supprimer cette photo/vidéo? Il n'y a pas de corbeille",
            formClass: "form-btn",
            submitClass: "btn"
        },
        fields: {
        }
    }
}
