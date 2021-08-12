import Controller from "../Core/Controller";
import CheckService from "../Services/CheckService";
import CommentForm from "../Forms/Comment";
import Validator from "../Core/Validator";
import User from "../Entities/User";
import Comment from "../Entities/Comment";
import CommentDelete from "../Forms/CommentDelete";
import CommentEdit from "../Forms/CommentEdit";

export default class CommentController extends Controller {
    create = async () => {
        const {familySlug,sectionSlug,mediaSlug} = this.req.params;

        const mediaSectionAndFamily = await CheckService.checkMediaAndFamily(familySlug,sectionSlug,mediaSlug,this, true);

        if (mediaSectionAndFamily) {
            const {media} = mediaSectionAndFamily;
            const commentForm = CommentForm(familySlug,sectionSlug,media,this.req.session.user.id);
            const validator = new Validator(this.req,commentForm);

            if (validator.isSubmitted() && await validator.isValid(false)) {

                const comment = await validator.save();

                this.res.json({status: "success", id: comment.getId()});
            } else {
                this.res.json({status: "failed", errors: validator.getErrors()});
            }
            return;
        }
        this.res.json({status: "failed", errors: ["Formulaire non soumis"]});
    }

    delete = async () => {
        const {commentId} = this.req.params;

        const commentDeleteForm = CommentDelete(commentId);
        const validator = new Validator(this.req,commentDeleteForm);
        if (validator.isSubmitted()) {
            if (await validator.isValid(false)) {
                const comment = <Comment>validator.entity;

                if (comment.getUserId() != this.req.session.user.id) {
                    this.res.json({status: "failed", errors: ["Vous n'êtes pas l'auteur de ce commentaire"]});
                    return;
                }

                await comment.delete();
                this.res.json({status: "success"})
            } else {
                this.res.json({status: "failed", errors: validator.getErrors()});
                delete this.req.session.flash;
            }
            return;
        }
        this.res.json({status: "failed", errors: ["Formulaire non soumis"]});
    }

    edit = async () => {
        const {commentId} = this.req.params;

        const commentEditForm = CommentEdit(commentId);
        const validator = new Validator(this.req,commentEditForm);

        if (validator.isSubmitted()) {
            if (await validator.isValid(false)) {
                const comment = <Comment>validator.entity;
                if (comment.getUserId() != this.req.session.user.id) {
                    this.res.json({status: "failed", errors: ["Vous n'êtes pas l'auteur de ce commentaire"]});
                    return;
                }

                await validator.save();

                this.res.json({status: "success"});
            } else {
                this.res.json({status: "failed", errors: validator.getErrors()});
            }
            return;
        }
        this.res.json({status: "failed", errors: ["Formulaire non soumis"]});
    }
}
