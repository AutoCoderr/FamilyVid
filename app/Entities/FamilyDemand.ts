import EntityManager from "../Core/EntityManager";
import User from "./User";
import FamilyDemandModel from "../Models/FamilyDemand";
import Family from "./Family";

export default class FamilyDemand extends EntityManager {

    Model = FamilyDemandModel;

    visible: null|boolean = null;

    User: null|User = null;
    Applicant: null|User = null;
    Family: null|Family = null;

    UserId: null|number = null;
    ApplicantId: null|number = null;
    FamilyId: null|number = null

    getVisible() {
        return this.visible;
    }
    setVisible(visible: boolean) {
        this.visible = visible;
    }

    setUser(user: User) {
        this.User = user;
        this.UserId = user.getId();
    }
    getUser() {
        if (!(this.User instanceof User) && this.User != null) {
            this.User = (new User()).hydrate(this.User);
        }
        return this.User;
    }

    setApplicant(applicant: User) {
        this.Applicant = applicant;
        this.ApplicantId = applicant.getId();
    }
    getApplicant() {
        if (!(this.Applicant instanceof User) && this.Applicant != null) {
            this.Applicant = (new User()).hydrate(this.Applicant);
        }
        return this.Applicant;
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
