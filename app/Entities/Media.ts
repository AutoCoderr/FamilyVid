import EntityManager from "../Core/EntityManager";
import MediaModel from "../Models/Media";
import Section from "./Section";
import Comment from "./Comment";
import Helpers from "../Core/Helpers";

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
    type: null|string = null;

    Section: null|Section = null;
    SectionId : null|number = null;

    Comments: null|Array<Comment> = [];

    setName(name: string) {
        this.name = name;
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

    setType(type: string) {
        this.type = type;
    }
    getType() {
        return this.type;
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
