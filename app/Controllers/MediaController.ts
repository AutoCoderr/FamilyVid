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
import DeplaceMedia from "../Forms/DeplaceMedia";

export default class MediaController extends Controller {

    index = async () => {
        const {sectionId,familySlug} = this.req.params;
        const sectionAndFamily = await CheckService.checkSectionAndFamily(familySlug,sectionId, this);

        if (sectionAndFamily) {
            const {section} = sectionAndFamily;
            this.render("media/index.html.twig", {section});
        }
    }

    new = async () => {
        const {sectionId,familySlug} = this.req.params;

        const sectionAndFamily = await CheckService.checkSectionAndFamily(familySlug,sectionId, this);

        if (sectionAndFamily) {
            const {section} = sectionAndFamily;
            const mediaForm = MediaForm(familySlug,sectionId);
            const validator = new Validator(this.req,mediaForm);

            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    const datas = this.getDatas();
                    let media = new Media();
                    media.setDate(datas.date);
                    media.setName(datas.name != "" ? datas.name : datas.date);
                    await media.setSlugFrom("name");
                    media.setType(datas.type);
                    media.setSection(section);

                    await media.save();

                    this.setFlash("media_success", "Photo/video ajoutée avec succès!");

                    this.redirectToRoute("media_index", {familySlug,sectionId});
                } else {
                    this.redirect(this.req.header('Referer'));
                }
            } else {
                this.generateToken();
                this.render("media/new.html.twig", {mediaForm,sectionId,familySlug})
            }
        }
    }

    edit = async () => {
        const {familySlug,sectionId,mediaId} = this.req.params;

        const mediaSectionAndFamily = await CheckService.checkMediaAndFamily(familySlug,sectionId,mediaId,this);

        if (mediaSectionAndFamily) {
            const {media,section,family} = mediaSectionAndFamily;

            const mediaForm = MediaForm(familySlug,sectionId,mediaId);
            const validator = new Validator(this.req,mediaForm);

            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    const datas = this.getDatas();

                    media.setDate(datas.date);
                    media.setName(datas.name);
                    await media.setSlugFrom("name");
                    media.setType(datas.type);

                    await media.save();

                    this.redirectToRoute("media_index", {familySlug,sectionId});
                } else {
                    this.redirect(this.req.header('Referer'));
                }
                return;
            }
            let deplaceMediaForm;
            if ((<Array<Section>>family.getSections()).length > 1) {
                deplaceMediaForm = await DeplaceMedia(family, sectionId, mediaId);
                const deplaceMediaValidator = new Validator(this.req, deplaceMediaForm);

                if (deplaceMediaValidator.isSubmitted()) {
                    if (await deplaceMediaValidator.isValid()) {
                        const datas = this.getDatas();

                        const newSection: Section = await SectionRepository.findOne(datas.section);
                        media.setSection(newSection);
                        await media.save();

                        this.setFlash("media_success", "La " + (media.getType() == "video" ? "vidéo" : "photo") + " a été déplacée dans la rubrique '" + newSection.getName() + "'");
                        this.redirectToRoute("media_index", {familySlug, sectionId});
                    } else {
                        this.redirect(this.req.header('Referer'));
                    }
                    return;
                }
            }


            this.generateToken();
            Helpers.hydrateForm(media, mediaForm);

            const deleteMediaForm = DeleteMedia(family.getSlug(),section.getId(),media.getId());
            this.render("media/edit.html.twig",
                {
                    familySlug: family.getSlug(),
                    media,
                    mediaForm,
                    deleteMediaForm,
                    ...((<Array<Section>>family.getSections()).length > 1 ? {deplaceMediaForm} : {})
                });
        }
    }

    delete = async () => {
        const {familySlug,sectionId,mediaId} = this.req.params;

        const mediaSectionAndFamily = await CheckService.checkMediaAndFamily(familySlug,sectionId,mediaId,this);

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
            this.redirectToRoute('media_index',{familySlug,sectionId});
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
