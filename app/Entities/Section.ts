import EntityManager from "../Core/EntityManager";
import SectionModel from "../Models/Section";
import Family from "./Family";
import Media from "./Media";
import Helpers from "../Core/Helpers";

export default class Section extends EntityManager {

    Model = SectionModel;

    entityTypes = {
        Medias: Media.name
    }

    name: null|string = null;
    slug: null|string = null;

    Family: null|Family = null;
    FamilyId : null|number = null;

    Medias : null|Array<Media> = [];

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

    setFamily(family: Family) {
        this.Family = family;
        this.FamilyId = family.getId();
    }
    getFamily() {
        return this.Family;
    }
    getFamilyId() {
        return this.FamilyId;
    }

    getMedias() {
        return this.Medias;
    }

}
