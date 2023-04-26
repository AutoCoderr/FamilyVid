import Controller from "../Core/Controller";
import FamilyRepository from "../Repositories/FamilyRepository";
import Family from "../Entities/Family";
import SectionForm from "../Forms/Section";
import Validator from "../Core/Validator";
import Section from "../Entities/Section";
import SectionRepository from "../Repositories/SectionRepository";
import CheckService from "../Services/CheckService";
import Helpers from "../Core/Helpers";
import MediaRepository from "../Repositories/MediaRepository";
import Media from "../Entities/Media";
import DeleteSection from "../Forms/DeleteSection";
import DeleteAllSectionMedias from "../Forms/DeleteAllSectionMedias";
import DeplaceSectionMediasAndDelete from "../Forms/DeplaceSectionMediasAndDelete";
import FileUploadService from "../Services/FileUploadService";

export default class SectionController extends Controller {
    index = async () => {
        const {familySlug} = this.req.params;
        const family: Family = await FamilyRepository.findOneBySlug(familySlug);

        if (CheckService.checkFamily(family,this)) {
            this.render("section/index.html.twig", {family});
        }
    }

    delete = async () => {
        const {familySlug,sectionSlug} = this.req.params;

        const sectionAndFamily = await CheckService.checkSectionAndFamily(familySlug,sectionSlug, this);

        if (sectionAndFamily) {
            const {family,section} = sectionAndFamily;
            const deleteSectionForm = DeleteSection(family.getSlug(),sectionSlug);
            const validator = new Validator(this.req,deleteSectionForm);
            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    if ((<Array<Media>>section.getMedias()).length == 0) {
                        await FileUploadService.deleteSection(family,section);
                        this.setFlash("section_success", "Rubrique supprimée avec succès!");
                    } else {
                        this.redirectToRoute("section_delete_with_media",{familySlug: family.getSlug(), sectionSlug: sectionSlug});
                        return;
                    }
                } else {
                    this.redirect(this.req.header('Referer'));
                    return;
                }
            }
            this.redirectToRoute("section_index", {familySlug});
        }
    }

    delete_with_media = async () => {
        const {familySlug,sectionSlug} = this.req.params;

        const sectionAndFamily = await CheckService.checkSectionAndFamily(familySlug,sectionSlug, this);

        if (sectionAndFamily) {
            const {family,section} = sectionAndFamily;

            const deleteAllMediasForm = DeleteAllSectionMedias(family.getSlug(),sectionSlug);
            const validatorDeleteAllMedias = new Validator(this.req,deleteAllMediasForm);

            if (validatorDeleteAllMedias.isSubmitted()) {
                if (await validatorDeleteAllMedias.isValid()) {
                    this.setFlash("section_success", "Rubrique supprimée avec succès!");
                    await FileUploadService.deleteSection(family,section);
                    this.redirectToRoute("section_index", {familySlug: family.getSlug()});
                } else {
                    this.redirect(this.req.header('Referer'));
                }
                return;
            }

            let deplaceMediasForm;
            if ((<Array<Section>>family.getSections()).length > 1) {
                deplaceMediasForm = await DeplaceSectionMediasAndDelete(family, section);
                const validatorDeplaceMedias = new Validator(this.req, deplaceMediasForm);

                if (validatorDeplaceMedias.isSubmitted()) {
                    if (await validatorDeplaceMedias.isValid()) {
                        const datas = this.getDatas();
                        const newSection: Section = await SectionRepository.findOne(datas.section);

                        if (!await FileUploadService.moveAllMedia(section,newSection)) {
                            validatorDeplaceMedias.setFlashErrors(["Déplacement des photos/videos de la rubrique échoué"]);
                            this.redirect(this.req.header('Referer'));
                            return;
                        }

                        await FileUploadService.deleteSection(family,section);
                        this.setFlash("section_success", "Rubrique supprimée avec succès!");
                        this.redirectToRoute("section_index", {familySlug: family.getSlug()});
                    } else {
                        this.redirect(this.req.header('Referer'));
                    }
                    return;
                }
            }

            this.generateToken();
            this.render("section/delete_with_media.html.twig",
                {
                    section,
                    deleteAllMediasForm,
                    ...((<Array<Section>>family.getSections()).length > 1 ? {deplaceMediasForm} : {})
                });
        }
    }

    edit = async () => {
        const {familySlug,sectionSlug} = this.req.params;

        const sectionAndFamily = await CheckService.checkSectionAndFamily(familySlug,sectionSlug, this);

        if (sectionAndFamily) {
            const {family,section} = sectionAndFamily;

            const sectionForm = SectionForm(family, sectionSlug);
            const validator = new Validator(this.req,sectionForm);

            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    const datas = this.getDatas();

                    await FileUploadService.renameSection(family,section,datas.name);

                    this.setFlash("section_success", "Rubrique éditée avec succès!");
                    this.redirectToRoute("section_index", {familySlug});
                } else {
                    this.redirect(this.req.header('Referer'));
                }
            } else {
                this.generateToken();
                Helpers.hydrateForm(section, sectionForm);

                const deleteSectionForm = DeleteSection(family.getSlug(),sectionSlug);
                this.render("section/edit.html.twig", {sectionForm,deleteSectionForm, section});
            }
        }

    }

    new = async () => {
        const {familySlug} = this.req.params;
        const family: Family = await FamilyRepository.findOneBySlug(familySlug);

        if (CheckService.checkFamily(family,this)) {
            const sectionForm = SectionForm(family);
            const validator = new Validator(this.req, sectionForm);

            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    const datas = this.getDatas();

                    const section = new Section();
                    section.setName(datas.name);
                    await section.setSlugFrom("name");
                    section.setFamily(family);

                    await section.save();
                    this.setFlash("section_success", "Rubrique créée avec succès!");
                    this.redirectToRoute("section_index", {familySlug});
                } else {
                    this.redirect(this.req.header('Referer'));
                }
            } else {
                this.generateToken();
                this.render("section/new.html.twig", {sectionForm, familySlug: family.getSlug()});
            }
        }
    }

    search = async () => {
        const {search} = this.req.body;
        const {familySlug} = this.req.params;

        const family: Family = await FamilyRepository.findOneBySlug(familySlug);

        if (CheckService.checkFamily(family,this,true)) {
            let sections = await SectionRepository.findAllByFamilyAndSearch(family.getId(),search);
            sections = sections.map(section => {
                return {
                    slug: section.getSlug(),
                    name: section.getName()
                }
            });
            this.res.json(sections);
        }
    }

    global = async () => {
        const {familySlug} = this.req.params;

        const family: Family = await FamilyRepository.findOneBySlug(familySlug);

        if (CheckService.checkFamily(family,this)) {
            const sectionsId = <Array<number>>(<Array<Section>>family.getSections()).map(section =>
                section.getId()
            );
            let medias: Array<Media|any> = await MediaRepository.findAllBySectionIdAndSearchFilters(sectionsId,"","ASC","date", "all");
            medias = medias.map(media => {
                return {
                    name: media.getName(),
                    date: media.getDate(),
                    type: media.getType(),
                    slug: media.getSlug(),
                    sectionSlug: media.getSection().getSlug(),
                    sectionName: media.getSection().getName()
                }
            });
            this.render("section/global.html.twig", {family,medias})
        }
    }

    global_search = async () => {
        const {familySlug} = this.req.params;

        const family: Family = await FamilyRepository.findOneBySlug(familySlug);

        if (CheckService.checkFamily(family,this,true)) {
            const {search,sort,sortBy,toDisplay} = this.req.body;
            const sectionsId = <Array<number>>(<Array<Section>>family.getSections()).map(section =>
                section.getId()
            );
            let medias: Array<Media|any> = await MediaRepository.findAllBySectionIdAndSearchFilters(sectionsId,search,sort,sortBy,toDisplay);
            medias = medias.map(media => {
                return {
                    name: media.getName(),
                    date: Helpers.formatDate(<Date>media.getDate()),
                    type: media.getType(),
                    slug: media.getSlug(),
                    sectionSlug: media.getSection().getSlug(),
                    sectionName: media.getSection().getName()
                }
            });
            this.res.json(medias);
        }
    }
}
