import Helpers from "../Core/Helpers";

export default function DenyDemand(familySlug,sectionSlug,mediaSlug) {
    return {
        config: {
            action: Helpers.getPath("comment_create", {familySlug,sectionSlug,mediaSlug}),
            method: "POST",
            submit: "Ajouter",
            actionName: "create_comment",
            msgError: "Création du commentaire échoué",
            submitClass: "btn"
        },
        fields: {
            content: {
                type: "textarea",
                minLength: 2,
                msgError: "Le commentaire doit faire minimum 2 caractères",
                required: true
            }
        }
    }
}
