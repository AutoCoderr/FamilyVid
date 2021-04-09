import Controller from "../Core/Controller";
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
        const {sectionSlug,familySlug} = this.req.params;
        const sectionAndFamily = await CheckService.checkSectionAndFamily(familySlug,sectionSlug, this);

        if (sectionAndFamily) {
            const {section} = sectionAndFamily;
            this.render("media/index.html.twig", {section});
        }
    }

    new = async () => {
        const {sectionSlug,familySlug} = this.req.params;

        const sectionAndFamily = await CheckService.checkSectionAndFamily(familySlug,sectionSlug, this);

        if (sectionAndFamily) {
            const {section} = sectionAndFamily;
            const mediaForm = MediaForm(familySlug,sectionSlug);
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

                    this.redirectToRoute("media_index", {familySlug,sectionSlug});
                } else {
                    this.redirect(this.req.header('Referer'));
                }
            } else {
                this.generateToken();
                this.render("media/new.html.twig", {mediaForm,sectionSlug,familySlug})
            }
        }
    }

    edit = async () => {
        const {familySlug,sectionSlug,mediaId} = this.req.params;

        const mediaSectionAndFamily = await CheckService.checkMediaAndFamily(familySlug,sectionSlug,mediaId,this);

        if (mediaSectionAndFamily) {
            const {media,section,family} = mediaSectionAndFamily;

            const mediaForm = MediaForm(familySlug,sectionSlug,mediaId);
            const validator = new Validator(this.req,mediaForm);

            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    const datas = this.getDatas();

                    media.setDate(datas.date);
                    media.setName(datas.name);
                    await media.setSlugFrom("name");
                    media.setType(datas.type);

                    await media.save();

                    this.redirectToRoute("media_index", {familySlug,sectionSlug});
                } else {
                    this.redirect(this.req.header('Referer'));
                }
                return;
            }
            let deplaceMediaForm;
            if ((<Array<Section>>family.getSections()).length > 1) {
                deplaceMediaForm = await DeplaceMedia(family, section, mediaId);
                const deplaceMediaValidator = new Validator(this.req, deplaceMediaForm);

                if (deplaceMediaValidator.isSubmitted()) {
                    if (await deplaceMediaValidator.isValid()) {
                        const datas = this.getDatas();

                        const newSection: Section = await SectionRepository.findOne(datas.section);
                        media.setSection(newSection);
                        await media.setSlugFrom("name");
                        await media.save();

                        this.setFlash("media_success", "La " + (media.getType() == "video" ? "vidéo" : "photo") + " a été déplacée dans la rubrique '" + newSection.getName() + "'");
                        this.redirectToRoute("media_index", {familySlug, sectionSlug});
                    } else {
                        this.redirect(this.req.header('Referer'));
                    }
                    return;
                }
            }


            this.generateToken();
            Helpers.hydrateForm(media, mediaForm);

            const deleteMediaForm = DeleteMedia(family.getSlug(),section.getSlug(),media.getId());
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
        const {familySlug,sectionSlug,mediaId} = this.req.params;

        const mediaSectionAndFamily = await CheckService.checkMediaAndFamily(familySlug,sectionSlug,mediaId,this);

        if (mediaSectionAndFamily) {
            const {media,section,family} = mediaSectionAndFamily;

            const deleteMediaForm = DeleteMedia(family.getId(),section.getSlug(),media.getId());
            const validator = new Validator(this.req,deleteMediaForm);

            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    await media.delete();
                    this.setFlash("media_success", "La photo/vidéo '"+media.getName()+"' a été supprimée avec succès!");
                } else {
                    this.redirect(this.req.header('Referer'));
                    return;
                }
            }
            this.redirectToRoute('media_index',{familySlug,sectionSlug});
        }
    }

    search = async () => {
        const {familySlug,sectionSlug} = this.req.params;

        const sectionAndFamily = await CheckService.checkSectionAndFamily(familySlug,sectionSlug, this, true);

        if (sectionAndFamily) {
            const {section} = sectionAndFamily;
            const {search,sort,sortBy,toDisplay} = this.req.body;
            let medias: Array<Media|any> = await MediaRepository.findAllBySectionIdAndSearchFilters(<number>section.getId(),search,sort,sortBy,toDisplay);
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
