import EntityManager from "../Core/EntityManager";
import MediaModel from "../Models/Media";
import Section from "./Section";

export default class Media extends EntityManager {

    Model = MediaModel;

    name: null|string = null;
    slug: null|string = null;
    date: null|Date = null;
    type: null|string = null;

    Section: null|Section = null;
    SectionId : null|number = null;

    setName(name: string) {
        this.name = name;
    }
    getName() {
        return this.name;
    }

    getSlug() {
        return this.slug;
    }

    setDate(date: string) {
        this.date = new Date(date);
    }
    getDate(): null|Date {
        return this.date;
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
        if (!(this.Section instanceof Section) && this.Section != null) {
            this.Section = (new Section()).hydrate(this.Section);
        }
        return this.Section;
    }

}
