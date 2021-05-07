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
import FileUploadService from "../Services/FileUploadService";
import Comment from "../Entities/Comment";
import CommentForm from "../Forms/Comment";
import CommentRepository from "../Repositories/CommentRepository";
import CommentDelete from "../Forms/CommentDelete";
import CommentEdit from "../Forms/CommentEdit";

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
                    if(await FileUploadService.uploadMedia(this.getDatas(),section)) {
                        this.setFlash("media_success", "Photo/video ajoutée avec succès!");
                        this.redirectToRoute("media_index", {familySlug,sectionSlug});
                    } else {
                        validator.setFlashErrors("Echec de mise en ligne de la photo/video. Regardez peut être le nom du fichier");
                        this.redirect(this.req.header('Referer'));
                    }
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
        const {familySlug,sectionSlug,mediaSlug} = this.req.params;

        const mediaSectionAndFamily = await CheckService.checkMediaAndFamily(familySlug,sectionSlug,mediaSlug,this);

        if (mediaSectionAndFamily) {
            const {media,section,family} = mediaSectionAndFamily;

            const mediaForm = MediaForm(familySlug,sectionSlug,mediaSlug);
            const validator = new Validator(this.req,mediaForm);

            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    const datas = this.getDatas();

                    media.setDate(datas.date);
                    if (datas.tags) {
                        media.setTags(datas.tags);
                    }

                    if (media.getName() != datas.name && !(await FileUploadService.renameMedia(family, section, media, datas.name))) {
                        validator.setFlashErrors(["La photo/video ne peut pas être renommée"]);
                        this.redirect(this.req.header('Referer'));
                        return;
                    }

                    await media.save();

                    this.redirectToRoute("media_index", {familySlug,sectionSlug});
                } else {
                    this.redirect(this.req.header('Referer'));
                }
                return;
            }
            let deplaceMediaForm;
            if ((<Array<Section>>family.getSections()).length > 1) {
                deplaceMediaForm = await DeplaceMedia(family, section, mediaSlug);
                const deplaceMediaValidator = new Validator(this.req, deplaceMediaForm);

                if (deplaceMediaValidator.isSubmitted()) {
                    if (await deplaceMediaValidator.isValid()) {
                        const datas = this.getDatas();

                        const newSection: Section = await SectionRepository.findOne(datas.section);

                        if (!await FileUploadService.moveMedia(family,section,newSection,media)) {
                            deplaceMediaValidator.setFlashErrors(["La photo/video ne peut pas être déplacée"]);
                            this.redirect(this.req.header('Referer'));
                            return;
                        }

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

            const deleteMediaForm = DeleteMedia(family.getSlug(),section.getSlug(),media.getSlug());
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
        const {familySlug,sectionSlug,mediaSlug} = this.req.params;

        const mediaSectionAndFamily = await CheckService.checkMediaAndFamily(familySlug,sectionSlug,mediaSlug,this);

        if (mediaSectionAndFamily) {
            const {media,section,family} = mediaSectionAndFamily;

            const deleteMediaForm = DeleteMedia(family.getSlug(),section.getSlug(),media.getSlug());
            const validator = new Validator(this.req,deleteMediaForm);

            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    await FileUploadService.deleteMedia(family,section,media);
                    this.setFlash("media_success", "La photo/vidéo '"+media.getName()+"' a été supprimée avec succès!");
                } else {
                    this.redirect(this.req.header('Referer'));
                    return;
                }
            }
            this.redirectToRoute('media_index',{familySlug,sectionSlug});
        }
    }

    view = async () => {
        const {familySlug,sectionSlug,mediaSlug} = this.req.params;

        const mediaSectionAndFamily = await CheckService.checkMediaAndFamily(familySlug,sectionSlug,mediaSlug,this);

        if (mediaSectionAndFamily) {
            const {media, section, family} = mediaSectionAndFamily;
            const comments: Array<Comment> = await CommentRepository.findAllByMediaId(media.getId());

            const commentForm = CommentForm(familySlug,sectionSlug,mediaSlug);

            let commentDeleteForms: any = {};
            let commentEditForms: any = {};
            for (const comment of comments) {
                commentDeleteForms[<number>comment.getId()] = CommentDelete(comment.getId());
                commentEditForms[<number>comment.getId()] = CommentEdit(comment.getId());
            }

            const commentDeleteFormPrototype = CommentDelete(0);
            const commentEditFormPrototype = CommentEdit(0);

            this.generateToken();

            media.setNbViews(<number>media.getNbViews()+1);
            await media.save();

            this.render("media/view.html.twig", {
                comments,
                commentForm,
                commentDeleteForms,
                commentDeleteFormPrototype,
                commentEditForms,
                commentEditFormPrototype,
                media,
                section,
                family
            });
        }
    }

    read = async () => {
        const {familySlug,sectionSlug,mediaSlug} = this.req.params;

        const mediaSectionAndFamily = await CheckService.checkMediaAndFamily(familySlug,sectionSlug,mediaSlug,this);

        if (mediaSectionAndFamily) {
            const {media, section, family} = mediaSectionAndFamily;

            FileUploadService.readMedia(family,section,media,this.res)
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
                    name: media.getName(),
                    date: Helpers.formatDate(<Date>media.getDate()),
                    type: media.getType(),
                    slug: media.getSlug()
                }
            });
            this.res.json(medias);
        }
    }
}
