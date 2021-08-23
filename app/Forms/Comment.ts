import Helpers from "../Core/Helpers";
import CommentEntity from "../Entities/Comment";
import User from "../Entities/User";
import Media from "../Entities/Media";

export default function Comment(familySlug,sectionSlug,media: Media,userId) {
    return {
        config: {
            action: Helpers.getPath("comment_create", {familySlug,sectionSlug,mediaSlug: media.getSlug()}),
            method: "POST",
            submit: "Ajouter",
            actionName: "create_comment",
            msgError: "Création du commentaire échouée",
            submitClass: "btn",
            entity: CommentEntity
        },
        fields: {
            content: {
                type: "textarea",
                minLength: 2,
                msgError: "Le commentaire doit faire minimum 2 caractères",
                required: true
            },
            user: {
                type: "param",
                required: true,
                value: userId,
                entity: User
            },
            media: {
                type: "param",
                required: true,
                value: media,
                entity: Media
            },
            updated: {
                type: "param",
                required: true,
                value: false
            }
        }
    }
}
