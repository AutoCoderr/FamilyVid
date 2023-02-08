import EntityManager from "../Core/EntityManager";
import CommentModel from "../Models/Comment";
import Media from "./Media";
import User from "./User";
import Helpers from "../Core/Helpers";

export default class Comment extends EntityManager {

    Model = CommentModel;

    content: null|string = null;
    createdAt: null|Date = null;

    Media: null|Media = null;
    MediaId : null|number = null;

    User: null|User = null;
    UserId: null|number = null;

    setContent(content: string) {
        this.content = content;
    }
    getContent() {
        return Helpers.escapeHtml(this.content);
    }

    getCreatedAt() {
        return this.createdAt;
    }

    setMedia(media: Media) {
        this.Media = media;
        this.MediaId = media.getId();
    }
    getMedia() {
        return this.Media;
    }

    setUser(user: User) {
        this.User = user;
        this.UserId = user.getId();
    }
    getUser() {
        return this.User;
    }

}
