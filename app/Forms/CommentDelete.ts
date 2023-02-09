import Helpers from "../Core/Helpers";
import Comment from "../Entities/Comment";

export default function CommentDelete(commentId) {
    return {
        config: {
            action: Helpers.getPath("comment_delete"),
            method: "POST",
            submit: "X",
            actionName: "delete_comment_"+commentId,
            confirmOnSumit: "Voulez vous vraiment supprimer ce commentaire?",
            msgError: "Suppression du commentaire échouée",
            submitClass: "btn btn-form-action",
            formClass: "form-btn",
        },
        fields: {
            comment: {
                type: "hidden",
                required: true,
                value: commentId,
                entity: Comment.name
            }
        }
    }
}
