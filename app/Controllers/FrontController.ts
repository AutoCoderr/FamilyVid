import Controller from "../Core/Controller";
import User from "../Entities/User";
import Family from "../Entities/Family";
import Section from "../Entities/Section";
import Media from "../Entities/Media";
import MediaRepository from "../Repositories/MediaRepository";
import Helpers from "../Core/Helpers";
import SectionRepository from "../Repositories/SectionRepository";

export default class FrontController extends Controller {
    index = async () => {
        const user = await <Promise<User>>this.getUser(true);
        let pictureA: null|Media = null,
            pictureB: null|Media = null;
        if (user) { //@ts-ignore
            let pictures: Array<Media> = (<Array<Family>>user.getFamilies()).reduce((acc, family) => //@ts-ignore
                    [
                        ...acc, //@ts-ignore
                        ...(<Array<Section>>family.getSections()).reduce((acc, section) => //@ts-ignore
                                [
                                    ...acc, //@ts-ignore
                                    ...(<Array<Media>>section.getMedias())
                                        .filter(media => media.getType() === "picture")
                                        .reduce((acc, media) => //@ts-ignore
                                                [
                                                    ...acc,
                                                    ((media) => { //@ts-ignore
                                                        media.sectionSlug = section.getSlug(); //@ts-ignore
                                                        media.familySlug = family.getSlug();
                                                        return media;
                                                    })(media)
                                                ]
                                            , [])
                                ]
                            , [])
                    ]
                , []);
            if (pictures.length > 1) {
                pictureA = pictures[Helpers.rand(0, pictures.length - 1)];
                do {
                    pictureB = pictures[Helpers.rand(0, pictures.length - 1)];
                } while (pictureB.getId() === pictureA.getId());
            } else if (pictures.length === 1) {
                pictureA = pictures[0];
            }

            this.req.session.user = await user.serialize();
        }

        this.render("index.html.twig", {pictureA,pictureB});
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
