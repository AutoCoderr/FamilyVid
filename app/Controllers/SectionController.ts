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

export default class SectionController extends Controller {
    index = async () => {
        const {familyId} = this.req.params;
        const family: Family = await FamilyRepository.findOne(familyId);

        if (CheckService.checkFamily(family,this)) {
            this.render("section/index.html.twig", {family});
        }
    }

    delete = async () => {
        const {familyId,sectionId} = this.req.params;

        const sectionAndFamily = await CheckService.checkSectionAndFamily(familyId,sectionId, this);

        if (sectionAndFamily) {
            const {family,section} = sectionAndFamily;
            const deleteSectionForm = DeleteSection(family.id,sectionId);
            const validator = new Validator(this.req,deleteSectionForm);
            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    if ((<Array<Media>>section.getMedias()).length == 0) {
                        await section.delete();
                        this.setFlash("section_success", "Rubrique supprimée avec succès!");
                    } else {
                        this.redirectToRoute("section_delete_with_media",{familyId: family.id, sectionId: sectionId});
                        return;
                    }
                } else {
                    this.redirect(this.req.header('Referer'));
                    return;
                }
            }
            this.redirectToRoute("section_index", {familyId});
        }
    }

    delete_with_media = async () => {
        const {familyId,sectionId} = this.req.params;

        const sectionAndFamily = await CheckService.checkSectionAndFamily(familyId,sectionId, this);

        if (sectionAndFamily) {
            const {family,section} = sectionAndFamily;

            const deleteAllMediasForm = DeleteAllSectionMedias(family.getId(),sectionId);
            const validatorDeleteAllMedias = new Validator(this.req,deleteAllMediasForm);

            if (validatorDeleteAllMedias.isSubmitted()) {
                if (await validatorDeleteAllMedias.isValid()) {
                    this.setFlash("section_success", "Rubrique supprimée avec succès!");
                    await section.delete();
                    this.redirectToRoute("section_index", {familyId: family.getId()});
                } else {
                    this.redirect(this.req.header('Referer'));
                }
                return;
            }

            let deplaceMediasForm;
            if ((<Array<Section>>family.getSections()).length > 1) {
                deplaceMediasForm = await DeplaceSectionMediasAndDelete(family.getId(), sectionId);
                const validatorDeplaceMedias = new Validator(this.req, deplaceMediasForm);

                if (validatorDeplaceMedias.isSubmitted()) {
                    if (await validatorDeplaceMedias.isValid()) {
                        const datas = this.getDatas();
                        const newSection: Section = await SectionRepository.findOne(datas.section);

                        for (const media of <Array<Media>>section.getMedias()) {
                            media.setSection(newSection);
                            await media.save();
                        }
                        await section.delete();
                        this.setFlash("section_success", "Rubrique supprimée avec succès!");
                        this.redirectToRoute("section_index", {familyId: family.getId()});
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
        const {familyId,sectionId} = this.req.params;

        const sectionAndFamily = await CheckService.checkSectionAndFamily(familyId,sectionId, this);

        if (sectionAndFamily) {
            const {family,section} = sectionAndFamily;

            const sectionForm = SectionForm(familyId, sectionId);
            const validator = new Validator(this.req,sectionForm);

            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    const datas = this.getDatas();

                    section.setName(datas.name);
                    await section.setSlugFrom("name");
                    await section.save();
                    this.setFlash("section_success", "Rubrique éditée avec succès!");
                    this.redirectToRoute("section_index", {familyId});
                } else {
                    this.redirect(this.req.header('Referer'));
                }
            } else {
                this.generateToken();
                Helpers.hydrateForm(section, sectionForm);

                const deleteSectionForm = DeleteSection(family.getId(),sectionId);
                this.render("section/edit.html.twig", {sectionForm,deleteSectionForm, section});
            }
        }

    }

    new = async () => {
        const {familyId} = this.req.params;
        const family: Family = await FamilyRepository.findOne(familyId);

        if (CheckService.checkFamily(family,this)) {
            const sectionForm = SectionForm(familyId);
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
                    this.redirectToRoute("section_index", {familyId});
                } else {
                    this.redirect(this.req.header('Referer'));
                }
            } else {
                this.generateToken();
                this.render("section/new.html.twig", {sectionForm,familyId: family.id});
            }
        }
    }

    search = async () => {
        const {search} = this.req.body;
        const {familyId} = this.req.params;

        const family: Family = await FamilyRepository.findOne(familyId);

        if (CheckService.checkFamily(family,this,true)) {
            let sections = await SectionRepository.findAllByFamilyAndSearch(familyId,search);
            sections = await Helpers.serializeEntityArray(sections);
            sections = sections.map(section => {
                return {id: section.id, name: section.name}
            });
            this.res.json(sections);
        }
    }

    global = async () => {
        const {familyId} = this.req.params;

        const family: Family = await FamilyRepository.findOne(familyId);

        if (CheckService.checkFamily(family,this)) {
            const sectionsId = <Array<number>>(<Array<Section>>family.getSections()).map(section =>
                section.getId()
            );
            let medias: Array<Media|any> = await MediaRepository.findAllBySectionIdAndSearchFilters(sectionsId,"","ASC","date", "all");
            medias = medias.map(media => {
                return {
                    id: media.getId(),
                    name: media.getName(),
                    date: Helpers.formatDate(<Date>media.getDate()),
                    type: media.getType(),
                    sectionId: media.getSection().getId(),
                    sectionName: media.getSection().getName()
                }
            });
            this.render("section/global.html.twig", {family,medias})
        }
    }

    global_search = async () => {
        const {familyId} = this.req.params;

        const family: Family = await FamilyRepository.findOne(familyId);

        if (CheckService.checkFamily(family,this,true)) {
            const {search,sort,sortBy,toDisplay} = this.req.body;
            const sectionsId = <Array<number>>(<Array<Section>>family.getSections()).map(section =>
                section.getId()
            );
            let medias: Array<Media|any> = await MediaRepository.findAllBySectionIdAndSearchFilters(sectionsId,search,sort,sortBy,toDisplay);
            medias = medias.map(media => {
                return {
                    id: media.getId(),
                    name: media.getName(),
                    date: Helpers.formatDate(<Date>media.getDate()),
                    type: media.getType(),
                    sectionId: media.getSection().getId(),
                    sectionName: media.getSection().getName()
                }
            });
            this.res.json(medias);
        }
    }
}
