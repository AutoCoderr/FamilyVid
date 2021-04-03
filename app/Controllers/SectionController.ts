import Controller from "../Core/Controller";
import FamilyRepository from "../Repositories/FamilyRepository";
import Family from "../Entities/Family";
import SectionForm from "../Forms/Section";
import Validator from "../Core/Validator";
import Section from "../Entities/Section";
import SectionRepository from "../Repositories/SectionRepository";
import FamilyCheckService from "../Services/FamilyCheckService";
import Helpers from "../Core/Helpers";

export default class SectionController extends Controller {
    index = async () => {
        const {familyId} = this.req.params;
        const family: Family = await FamilyRepository.findOne(familyId);

        if (FamilyCheckService.checkFamily(family,this)) {
            this.render("section/index.html.twig", {family});
        }
    }

    delete = async () => {
        const {familyId,sectionId} = this.req.params;

        const section: null|Section = await SectionRepository.findOne(sectionId);
        if (section == null) {
            this.setFlash("section_failed", "La section que vous souhaitez supprimer n'existe pas");
            this.redirectToRoute("section_index", {familyId});
            return;
        }
        const family: Family = await FamilyRepository.findOne((<Family>section.getFamily()).getId());

        if (FamilyCheckService.checkFamily(family,this)) {
            await section.delete();
            this.setFlash("section_success", "Rubrique supprimée avec succès!");
            this.redirectToRoute("section_index", {familyId});
        }
    }

    edit = async () => {
        const {familyId,sectionId} = this.req.params;

        const section: null|Section = await SectionRepository.findOne(sectionId);
        if (section == null) {
            this.setFlash("section_failed", "La section que vous souhaitez éditer n'existe pas");
            this.redirectToRoute("section_index", {familyId});
            return;
        }
        const family: Family = await FamilyRepository.findOne((<Family>section.getFamily()).getId());

        if (FamilyCheckService.checkFamily(family,this)) {
            const sectionForm = SectionForm(familyId, sectionId);
            const validator = new Validator(this.req,sectionForm);
            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    const datas = this.getDatas();

                    section.setName(datas.name);
                    await section.save();
                    this.setFlash("section_success", "Rubrique éditée avec succès!");
                    this.redirectToRoute("section_index", {familyId});
                } else {
                    this.redirect(this.req.header('Referer'));
                }
            } else {
                Helpers.hydrateForm(section, sectionForm);
                this.render("section/edit.html.twig", {sectionForm, section});
            }
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
                this.render("section/new.html.twig", {sectionForm,familyId: family.id});
            }
        }
    }
}
