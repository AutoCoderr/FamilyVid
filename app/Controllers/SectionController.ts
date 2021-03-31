import Controller from "../Core/Controller";
import FamilyRepository from "../Repositories/FamilyRepository";
import User from "../Entities/User";
import Family from "../Entities/Family";
import SectionForm from "../Forms/Section";
import Validator from "../Core/Validator";
import Section from "../Entities/Section";
import SectionRepository from "../Repositories/SectionRepository";
import MediaForm from "../Forms/Media";
import Media from "../Entities/Media";
import FamilyCheckService from "../Services/FamilyCheckService";

export default class SectionController extends Controller {
    index = async () => {
        const {familyId} = this.req.params;
        const family: Family = await FamilyRepository.findOne(familyId);

        if (FamilyCheckService.checkFamily(family,this)) {
            this.render("section/index.html.twig", {family});
        }
    }

    new = async () => {
        const {familyId} = this.req.params;
        const family: Family = await FamilyRepository.findOne(familyId);

        if (FamilyCheckService.checkFamily(family,this)) {
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
}
