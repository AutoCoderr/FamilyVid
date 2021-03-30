import EntityManager from "../Core/EntityManager";
import MediaModel from "../Models/Media";
import Section from "./Section";
import Helpers from "../Core/Helpers";

export default class Media extends EntityManager {

    Model = MediaModel;

    name: null|string = null;
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

    setDate(date: Date) {
        this.date = date;
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
