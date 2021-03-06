import Helpers from "../Core/Helpers";
import Comment from "../Entities/Comment";

export default function CommentEdit(commentId) {
    return {
        config: {
            action: Helpers.getPath("comment_edit", {commentId}),
            method: "POST",
            submit: "Enregistrer",
            actionName: "edit_comment_"+commentId,
            msgError: "Modification du commentaire échouée",
            submitClass: "btn",
            formClass: "edit-comment-form",
            entity: Comment,
            id: commentId,
            entityNotFoundError: "Ce commentaire n'existe pas"
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
