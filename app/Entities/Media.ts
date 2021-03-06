import EntityManager from "../Core/EntityManager";
import MediaModel from "../Models/Media";
import Section from "./Section";
import Comment from "./Comment";
import Helpers from "../Core/Helpers";
import User from "./User";

export default class Media extends EntityManager {

    Model = MediaModel;

    entityTypes = {
        Comments: Comment.name
    }

    name: null|string = null;
    slug: null|string = null;
    fileExtension: null|string = null;
    date: null|Date = null;
    tags: null|string = null;
    nbViews: null|number = null;
    type: null|string = null;

    Section: null|Section = null;
    SectionId : null|number = null;

    User: null|User = null;
    UserId: null|number = null;

    Comments: null|Array<Comment> = [];

    async setName(name: string) {
        this.name = name;
        await this.setSlugFrom("name");
    }
    getName() {
        return Helpers.escapeHtml(this.name);
    }

    getSlug() {
        return this.slug;
    }

    getFileExtension() {
        return this.fileExtension;
    }
    setFileExtension(fileExtension) {
        this.fileExtension = fileExtension;
    }

    setDate(date: string) {
        this.date = new Date(date);
    }
    getDate(): null|Date {
        return this.date;
    }

    setTags(tags: string) {
        this.tags = tags;
    }
    getTags(): null|string {
        return this.tags;
    }

    getNbViews() {
        return this.nbViews;
    }
    setNbViews(nbViews: number) {
        this.nbViews = nbViews;
    }

    setType(type: string) {
        this.type = type;
    }
    getType() {
        return this.type;
    }

    setUser(user: null|User) {
        if (user != null) {
            this.User = user;
            this.UserId = user.getId();
        }
    }

    getUser() {
        return this.User;
    }

    setSection(section: Section) {
        this.Section = section;
        this.SectionId = section.getId();
    }
    getSection() {
        return this.Section;
    }

    getComments() {
        if (this.Comments instanceof Array) {
            this.Comments.sort((A,B) => {
                return (<Date>A.getCreatedAt()).getTime() - (<Date>B.getCreatedAt()).getTime()
            });
        }
        return this.Comments;
    }

}
