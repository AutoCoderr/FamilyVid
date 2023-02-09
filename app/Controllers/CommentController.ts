import Controller from "../Core/Controller";
import CheckService from "../Services/CheckService";
import CommentForm from "../Forms/Comment";
import Validator from "../Core/Validator";
import User from "../Entities/User";
import Comment from "../Entities/Comment";
import CommentDelete from "../Forms/CommentDelete";

export default class CommentController extends Controller {
    create = async () => {
        const {familySlug,sectionSlug,mediaSlug} = this.req.params;

        const mediaSectionAndFamily = await CheckService.checkMediaAndFamily(familySlug,sectionSlug,mediaSlug,this);

        if (mediaSectionAndFamily) {
            const {media} = mediaSectionAndFamily;
            const commentForm = CommentForm(familySlug,sectionSlug,mediaSlug);
            const validator = new Validator(this.req,commentForm);

            if (validator.isSubmitted() && await validator.isValid()) {
                const datas = this.getDatas();
                const user = await <Promise<User>>this.getUser();

                const comment = new Comment();
                comment.setContent(datas.content);
                comment.setMedia(media);
                comment.setUser(user);

                await comment.save();

                this.setFlash("comment_success", "Commentaire ajouté avec succès!");
            }

            this.redirect(this.req.header('Referer'));
        }
    }

    delete = async () => {
        const datas = this.getDatas();
        if (datas.comment == undefined) {
            this.res.json({status: "failed", errors: ["Commentaire non renseigné"]});
            return;
        }

        const commentDeleteForm = CommentDelete(datas.comment);
        const validator = new Validator(this.req,commentDeleteForm);
        if (validator.isSubmitted()) {
            if (await validator.isValid()) {
                const comment: Comment = validator.getDatas().comment;

                if (comment.getUserId() != this.req.session.user.id) {
                    this.res.json({status: "failed", errors: ["Vous n'êtes pas l'auteur de ce commentaire"]});
                    return;
                }

                await comment.delete();
                this.res.json({status: "success", id: comment.getId()})
            } else {
                this.res.json({status: "failed", errors: validator.getFlashErrors()});
                delete this.req.session.flash;
            }
            return;
        }
        this.res.json({status: "failed", errors: ["Formulaire non soumis"]});
    }
}