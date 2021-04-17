import RepositoryManager from "../Core/RepositoryManager";
import CommentModel from "../Models/Comment";
import Comment from "../Entities/Comment";
import UserModel from "../Models/User";

export default class CommentRepository extends RepositoryManager {
    static model = CommentModel;
    static entity = Comment;

    static findAllByMediaId(mediaId) {
        return super.findAllByParams({
            where: {
                MediaId: mediaId
            },
            include: UserModel,
            order: [["createdAt","DESC"]]
        })
    }
}