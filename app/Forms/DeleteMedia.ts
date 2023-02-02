import Helpers from "../Core/Helpers";

export default function DeleteMedia(familySlug,sectionId,mediaId) {
    return {
        config: {
            action: Helpers.getPath("media_delete", {familySlug,sectionId,mediaId}),
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
