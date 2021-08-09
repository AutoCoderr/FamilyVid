import Helpers from "../Core/Helpers";
import Comment from "../Entities/Comment";

export default function CommentDelete(commentId) {
    return {
        config: {
            action: Helpers.getPath("comment_delete", {commentId}),
            method: "POST",
            submit: "X",
            actionName: "delete_comment_"+commentId,
            confirmOnSubmit: "Voulez vous vraiment supprimer ce commentaire?",
            msgError: "Suppression du commentaire échouée",
            submitClass: "btn btn-form-action",
            formClass: "form-btn delete-comment-form",
            entity: Comment,
            id: commentId,
            entityNotFoundError: "Ce commentaire n'existe pas"
        }
    }
}
