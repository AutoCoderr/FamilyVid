import Controller from "../Core/Controller";
import FamilyRepository from "../Repositories/FamilyRepository";
import Family from "../Entities/Family";
import Validator from "../Core/Validator";
import Section from "../Entities/Section";
import SectionRepository from "../Repositories/SectionRepository";
import MediaForm from "../Forms/Media";
import Media from "../Entities/Media";
import FamilyCheckService from "../Services/FamilyCheckService";

export default class MediaController extends Controller {

    index = async () => {
        const {sectionId,familyId} = this.req.params;
        let section: null|Section = await SectionRepository.findOne(sectionId);
        if (section == null) {
            this.setFlash("section_failed", "Cette section n'existe pas");
            this.redirectToRoute("section_index", {familyId});
            return;
        }

        // Get family by repository, to get other relations entity (the users)
        const family = await <Promise<Family>>FamilyRepository.findOne((<Family>section.getFamily()).getId());

        if (FamilyCheckService.checkFamily(family,this)) {
            this.render("media/index.html.twig", {section});
        }
    }

    new = async () => {
        const {sectionId,familyId} = this.req.params;

        const section: null|Section = await SectionRepository.findOne(sectionId);
        if (section == null) {
            this.setFlash("section_failed", "La section dans laquelle vous souhaitez ajouter un media n'existe pas");
            this.redirectToRoute("section_index", {familyId})
            return;
        }

        // Get family by repository, to get other relations entity (the users)
        const family = await <Promise<Family>>FamilyRepository.findOne((<Family>section.getFamily()).getId());

        if (FamilyCheckService.checkFamily(family,this)) {
            const mediaForm = MediaForm(familyId,sectionId);
            const validator = new Validator(this.req,mediaForm);
            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    const datas = this.getDatas();
                    let media = new Media();
                    media.setDate(datas.date);
                    media.setName(datas.name != "" ? datas.name : datas.date);
                    media.setType(datas.type);
                    media.setSection(section);

                    await media.save();

                    this.setFlash("media_success", "Photo/video ajoutée avec succès!");

                    this.redirectToRoute("media_index", {familyId,sectionId});
                } else {
                    this.redirect(this.req.header('Referer'));
                }
            } else {
                this.render("section/new_media.html.twig", {mediaForm})
            }
        }
    }
}
