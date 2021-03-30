import Controller from "../Core/Controller";
import FamilyRepository from "../Repositories/FamilyRepository";
import User from "../Entities/User";
import Family from "../Entities/Family";
import SectionForm from "../Forms/Section";
import Validator from "../Core/Validator";
import Section from "../Entities/Section";

export default class SectionController extends Controller {
    index = async () => {
        const {familyId} = this.req.params;
        const family: Family = await FamilyRepository.findOne(familyId);

        if (this.checkFamily(family)) {
            this.render("section/index.html.twig", {family});
        }
    }

    new = async () => {
        const {familyId} = this.req.params;
        const family: Family = await FamilyRepository.findOne(familyId);

        if (this.checkFamily(family)) {
            const sectionForm = SectionForm(familyId);
            const validator = new Validator(this.req, sectionForm);
            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    const datas = this.getDatas();

                    const section = new Section();
                    section.setName(datas.name);
                    section.setFamily(family);

                    await section.save();
                    this.setFlash("section_success", "Rubrique créée avec succès!");
                    this.redirectToRoute("section_index", {familyId});
                } else {
                    this.redirect(this.req.header('Referer'));
                }
            } else {
                this.render("section/new.html.twig", {sectionForm});
            }
        }
    }

    checkFamily(family: null|Family) {
        if (family == null) {
            this.setFlash("access_family_failed", "Cette famille n'existe pas");
            this.redirectToRoute("index");
            return false;
        }

        let found = false;
        for (const user of <Array<User>>family.getUsers()) {
            if (user.getId() == this.req.session.user.id) {
                found = true;
                break;
            }
        }
        if (!found) {
            this.setFlash("access_family_failed", "Vous ne faites pas partie de cette famille");
            this.redirectToRoute("index");
            return false;
        }
        return true;
    }
}
