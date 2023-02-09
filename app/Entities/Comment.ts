import EntityManager from "../Core/EntityManager";
import CommentModel from "../Models/Comment";
import Media from "./Media";
import User from "./User";
import Helpers from "../Core/Helpers";

export default class Comment extends EntityManager {

    Model = CommentModel;

    content: null|string = null;
    updated: null|boolean = null;
    createdAt: null|Date = null;
    updatedAt: null|Date = null;

    Media: null|Media = null;
    MediaId : null|number = null;

    User: null|User = null;
    UserId: null|number = null;

    setContent(content: string) {
        this.content = content;
    }
    getContent() {
        return Helpers.escapeHtml(this.content).replace(/\n/g,"<br/>");
    }

    setUpdated(updated: boolean) {
        this.updated = updated;
    }
    getUpdated() {
        return this.updated;
    }

    getCreatedAt() {
        return this.createdAt;
    }
    getUpdatedAt() {
        return this.updatedAt;
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

    getUserId() {
        return this.UserId;
    }

}
