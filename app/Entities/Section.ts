import EntityManager from "../Core/EntityManager";
import SectionModel from "../Models/Section";
import Family from "./Family";
import Media from "./Media";

export default class Section extends EntityManager {

    Model = SectionModel;

    name: null|string = null;

    Family: null|Family = null;
    FamilyId : null|number = null;

    Medias : null|Array<Media> = [];

    setName(name: string) {
        this.name = name;
    }
    getName() {
        return this.name;
    }

    setFamily(family: Family) {
        this.Family = family;
        this.FamilyId = family.getId();
    }
    getFamily() {
        if (!(this.Family instanceof Family) && this.Family != null) {
            this.Family = (new Family()).hydrate(this.Family);
        }
        return this.Family;
    }

    getMedias() {
        if (this.Medias instanceof Array) {
            for (let i=0;i<this.Medias.length;i++) {
                if (!(this.Medias[i] instanceof Media)) {
                    this.Medias[i] = (new Media()).hydrate(this.Medias[i]);
                }
            }
            this.Medias.sort((A,B) => {
                return (<Date>A.getDate()).getTime() - (<Date>B.getDate()).getTime()
            });
        }
        return this.Medias;
    }

}
