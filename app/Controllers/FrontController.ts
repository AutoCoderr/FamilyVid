import Controller from "../Core/Controller";
import User from "../Entities/User";
import Family from "../Entities/Family";
import Section from "../Entities/Section";
import Media from "../Entities/Media";
import MediaRepository from "../Repositories/MediaRepository";
import Helpers from "../Core/Helpers";
import SectionRepository from "../Repositories/SectionRepository";
import FamilyRepository from "../Repositories/FamilyRepository";
import CheckService from "../Services/CheckService";

export default class FrontController extends Controller {
    index = async () => {
        if (this.req.session.user != undefined) {
            this.req.session.user = await (await <Promise<User>>this.getUser()).serialize();
        }
        this.render("index.html.twig");
    }

    global = async () => {
        const user: User = await <Promise<User>>this.getUser();

        const familyIds: Array<number> = <Array<number>>(<Array<Family>>user.getFamilies()).map(family => family.getId());
        const sections: Array<Section> = await SectionRepository.findAllByFamilyId(familyIds);

        const familyBySectionId: any = {};
        const sectionsId: Array<number> = <Array<number>>sections.map(section => {
            familyBySectionId[<number>section.getId()] = section.getFamily();
            return section.getId()
        });

        let medias: Array<Media|any> = await MediaRepository.findAllBySectionIdAndSearchFilters(sectionsId,"","ASC","date", "all");
        medias = medias.map(media => {
            return {
                name: media.getName(),
                date: media.getDate(),
                type: media.getType(),
                slug: media.getSlug(),
                sectionSlug: media.getSection().getSlug(),
                sectionName: media.getSection().getName(),
                familySlug: familyBySectionId[media.getSection().getId()].getSlug(),
                familyName: familyBySectionId[media.getSection().getId()].getName(),
            }
        });
        this.render("global.html.twig", {medias})
    }

    global_search = async () => {
        const {search,sort,sortBy,toDisplay} = this.req.body;
        const user: User = await <Promise<User>>this.getUser();

        const familyIds: Array<number> = <Array<number>>(<Array<Family>>user.getFamilies()).map(family => family.getId());
        const sections: Array<Section> = await SectionRepository.findAllByFamilyId(familyIds);

        const familyBySectionId: any = {};
        const sectionsId: Array<number> = <Array<number>>sections.map(section => {
            familyBySectionId[<number>section.getId()] = section.getFamily();
            return section.getId()
        });

        let medias: Array<Media|any> = await MediaRepository.findAllBySectionIdAndSearchFilters(sectionsId,search,sort,sortBy,toDisplay);
        medias = medias.map(media => {
            return {
                name: media.getName(),
                date: Helpers.formatDate(<Date>media.getDate()),
                type: media.getType(),
                slug: media.getSlug(),
                sectionSlug: media.getSection().getSlug(),
                sectionName: media.getSection().getName(),
                familySlug: familyBySectionId[media.getSection().getId()].getSlug(),
                familyName: familyBySectionId[media.getSection().getId()].getName(),
            }
        });
        this.res.json(medias);
    }
}

function rand(a,b) {
    return a+Math.floor(Math.random()*(b-a+1));
}
