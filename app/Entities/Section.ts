import EntityManager from "../Core/EntityManager";
import SectionModel from "../Models/Section";
import Family from "./Family";

export default class Section extends EntityManager {

    Model = SectionModel;

    name: null|string = null;

    Family: null|Family = null;
    FamilyId : null|number = null;

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

}
