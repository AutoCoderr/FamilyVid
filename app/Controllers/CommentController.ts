import Controller from "../Core/Controller";
import CheckService from "../Services/CheckService";
import CommentForm from "../Forms/Comment";
import Validator from "../Core/Validator";
import User from "../Entities/User";
import Comment from "../Entities/Comment";

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
}