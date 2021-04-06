import Controller from "../Core/Controller";
import FamilyRepository from "../Repositories/FamilyRepository";
import Family from "../Entities/Family";
import SectionForm from "../Forms/Section";
import Validator from "../Core/Validator";
import Section from "../Entities/Section";
import SectionRepository from "../Repositories/SectionRepository";
import FamilyCheckService from "../Services/FamilyCheckService";
import Helpers from "../Core/Helpers";
import MediaRepository from "../Repositories/MediaRepository";
import Media from "../Entities/Media";
import DeleteSection from "../Forms/DeleteSection";

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
            const deleteSectionForm = DeleteSection(family.id,sectionId);
            const validator = new Validator(this.req,deleteSectionForm);
            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    await section.delete();
                    this.setFlash("section_success", "Rubrique supprimée avec succès!");
                } else {
                    this.redirect(this.req.header('Referer'));
                    return;
                }
            }
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
                this.generateToken();
                this.render("section/new.html.twig", {sectionForm,familyId: family.id});
            }
        }
    }

    search = async () => {
        const {search} = this.req.body;
        const {familyId} = this.req.params;

        const family: Family = await FamilyRepository.findOne(familyId);

        if (FamilyCheckService.checkFamily(family,this,true)) {
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

        if (FamilyCheckService.checkFamily(family,this)) {
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

        if (FamilyCheckService.checkFamily(family,this,true)) {
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
