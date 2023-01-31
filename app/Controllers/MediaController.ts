import Controller from "../Core/Controller";
import FamilyRepository from "../Repositories/FamilyRepository";
import Family from "../Entities/Family";
import Validator from "../Core/Validator";
import Section from "../Entities/Section";
import SectionRepository from "../Repositories/SectionRepository";
import MediaForm from "../Forms/Media";
import Media from "../Entities/Media";
import CheckService from "../Services/CheckService";
import MediaRepository from "../Repositories/MediaRepository";
import Helpers from "../Core/Helpers";
import DeleteMedia from "../Forms/DeleteMedia";

export default class MediaController extends Controller {

    index = async () => {
        const {sectionId,familyId} = this.req.params;
        const sectionAndFamily = await CheckService.checkSectionAndFamily(familyId,sectionId, this);

        if (sectionAndFamily) {
            const {section} = sectionAndFamily;
            this.render("media/index.html.twig", {section});
        }
    }

    new = async () => {
        const {sectionId,familyId} = this.req.params;

        const sectionAndFamily = await CheckService.checkSectionAndFamily(familyId,sectionId, this);

        if (sectionAndFamily) {
            const {section} = sectionAndFamily;
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

        const mediaSectionAndFamily = await CheckService.checkMediaAndFamily(familyId,sectionId,mediaId,this);

        if (mediaSectionAndFamily) {
            const {media,section,family} = mediaSectionAndFamily;

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

                const deleteMediaForm = DeleteMedia(family.getId(),section.getId(),media.getId());
                this.render("media/edit.html.twig", {media, mediaForm,deleteMediaForm});
            }
        }
    }

    delete = async () => {
        const {familyId,sectionId,mediaId} = this.req.params;

        const mediaSectionAndFamily = await CheckService.checkMediaAndFamily(familyId,sectionId,mediaId,this);

        if (mediaSectionAndFamily) {
            const {media,section,family} = mediaSectionAndFamily;
            const deleteMediaForm = DeleteMedia(family.getId(),section.getId(),media.getId());
            const validator = new Validator(this.req,deleteMediaForm);
            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    await media.delete();
                    this.setFlash("media_success", "La photo/vidéo a été supprimée avec succès!");
                } else {
                    this.redirect(this.req.header('Referer'));
                    return;
                }
            }
            this.redirectToRoute('media_index',{familyId,sectionId});
        }
    }

    search = async () => {
        const {familyId,sectionId} = this.req.params;

        const sectionAndFamily = await CheckService.checkSectionAndFamily(familyId,sectionId, this, true);

        if (sectionAndFamily) {
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
