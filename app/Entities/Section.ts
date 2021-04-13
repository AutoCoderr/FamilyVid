import EntityManager from "../Core/EntityManager";
import SectionModel from "../Models/Section";
import Family from "./Family";
import Media from "./Media";

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

    setName(name: string) {
        this.name = name;
    }
    getName() {
        return this.name;
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
        if (this.Medias instanceof Array) {
            this.Medias.sort((A,B) => {
                return (<Date>A.getDate()).getTime() - (<Date>B.getDate()).getTime()
            });
        }
        return this.Medias;
    }

}
