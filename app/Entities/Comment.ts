import EntityManager from "../Core/EntityManager";
import MediaModel from "../Models/Media";
import Media from "./Media";
import User from "./User";

export default class Comment extends EntityManager {

    Model = MediaModel;

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
        return this.content;
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
