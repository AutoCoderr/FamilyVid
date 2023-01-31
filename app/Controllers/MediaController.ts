import Controller from "../Core/Controller";
import FamilyRepository from "../Repositories/FamilyRepository";
import Family from "../Entities/Family";
import Validator from "../Core/Validator";
import Section from "../Entities/Section";
import SectionRepository from "../Repositories/SectionRepository";
import MediaForm from "../Forms/Media";
import Media from "../Entities/Media";
import FamilyCheckService from "../Services/FamilyCheckService";
import MediaRepository from "../Repositories/MediaRepository";
import Helpers from "../Core/Helpers";

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
                this.generateToken();
                this.render("media/new.html.twig", {mediaForm,sectionId,familyId})
            }
        }
    }

    edit = async () => {
        const {familyId,sectionId,mediaId} = this.req.params;

        const media: null|Media = await MediaRepository.findOne(mediaId);
        if (media == null) {
            this.setFlash("media_failed", "La photo/vidéo que vous souhaitez éditer n'existe pas");
            this.redirectToRoute("media_index", {familyId,sectionId})
            return;
        }

        const section: Section = <Section>media.getSection();

        // Get family by repository, to get other relations entity (the users)
        const family = await <Promise<Family>>FamilyRepository.findOne(section.getFamilyId());

        if (FamilyCheckService.checkFamily(family,this)) {
            const mediaForm = MediaForm(familyId,sectionId,mediaId);
            const validator = new Validator(this.req,mediaForm);
            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    const datas = this.getDatas();

                    media.setDate(datas.date);
                    media.setName(datas.name);
                    media.setType(datas.type);

                    await media.save();

                    this.redirectToRoute("media_index", {familyId,sectionId});
                } else {
                    this.redirect(this.req.header('Referer'));
                }
            } else {
                this.generateToken();
                Helpers.hydrateForm(media, mediaForm);
                this.render("media/edit.html.twig", {media, mediaForm});
            }
        }
    }

    delete = async () => {
        const {familyId,sectionId,mediaId} = this.req.params;

        const media: null|Media = await MediaRepository.findOne(mediaId);
        if (media == null) {
            this.setFlash("media_failed", "La photo/vidéo que vous souhaitez supprimer n'existe pas");
            this.redirectToRoute("media_index", {familyId,sectionId})
            return;
        }

        const section: Section = <Section>media.getSection();

        // Get family by repository, to get other relations entity (the users)
        const family = await <Promise<Family>>FamilyRepository.findOne(section.getFamilyId());

        if (FamilyCheckService.checkFamily(family,this)) {
            await media.delete();
            this.setFlash("media_success", "La photo/vidéo a été supprimée avec succès!");
            this.redirectToRoute('media_index',{familyId,sectionId});
        }
    }

    search = async () => {
        const {sectionId} = this.req.params;

        const section: null|Section = await SectionRepository.findOne(sectionId);
        if (section == null) {
            this.res.json({error: "La section dans laquelle vous souhaitez ajouter un media n'existe pas"})
            return;
        }

        // Get family by repository, to get other relations entity (the users)
        const family = await <Promise<Family>>FamilyRepository.findOne((<Family>section.getFamily()).getId());

        if (FamilyCheckService.checkFamily(family,this,true)) {
            const {search,sort,sortBy,toDisplay} = this.req.body;
            let medias: Array<Media|any> = await MediaRepository.findAllBySectionIdAndSearchFilters(sectionId,search,sort,sortBy,toDisplay);
            medias = medias.map(media => {
                return {
                    id: media.getId(),
                    name: media.getName(),
                    date: Helpers.formatDate(<Date>media.getDate()),
                    type: media.getType()
                }
            });
            this.res.json(medias);
        }
    }
}
