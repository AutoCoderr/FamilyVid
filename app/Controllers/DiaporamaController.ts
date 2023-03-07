import Controller from "../Core/Controller";
import Family from "../Entities/Family";
import Section from "../Entities/Section";
import SectionRepository from "../Repositories/SectionRepository";
import User from "../Entities/User";
import Media from "../Entities/Media";
import MediaRepository from "../Repositories/MediaRepository";
import Helpers from "../Core/Helpers";

export default class DiaporamaController extends Controller {
    show = async () => {
        const {familySlug,sectionSlug,mediaSlug} = this.getDatas();

        const user = await <Promise<User>>this.getUser();

        const allUserFamilies: Array<Family> = <Array<Family>>user.getFamilies();
        let sectionsByFamily = {};
        for (const family of allUserFamilies) {
            sectionsByFamily[<number>family.getId()] = await SectionRepository.findAllByFamilyId(<number>family.getId()).then(sections => Helpers.serializeEntityArray(sections));
        }

        let family: null|Family = null;
        if (familySlug) {
            family = <Family>allUserFamilies.find(family => family.getSlug() == familySlug) ?? null;
            if (family == null) {
                return this.returnFailedError("Cette famille n'existe pas ou vous est inaccessible");
            }
        }
        let section: null|Section = null;
        if (sectionSlug) {
            if (family == null) {
                return this.returnFailedError("Vous devez spécifier une famille avant de spécifier une rubrique");
            }
            section = await SectionRepository.findOneBySlug(sectionSlug);
            if (section == null || section.getFamilyId() != family.getId()) {
                return this.returnFailedError("La rubrique spécifiée n'existe pas");
            }
        }

        let media: any|Media = null;
        if (mediaSlug) {
            media = await MediaRepository.findOneBySlug(mediaSlug);
            if (media == null || !allUserFamilies.map(family => family.getId()).includes((<Section>media.getSection()).getFamilyId())) {
                return this.returnFailedError("Photo inexistante ou inaccessible");
            } else if (media.getType() == "video") {
                return this.returnFailedError("Vous ne pouvez faire de diaporama avec des vidéos");
            } else if (section && (<Section>media.getSection()).getId() != section.getId()) {
                return this.returnFailedError("La photo spécifiée n'existe pas dans la rubrique "+section.getName());
            }
            const mediaFamily = (<Family>allUserFamilies.find(family => family.getId() == (<Section>(<Media>media).getSection()).getFamilyId()));
            const mediaFamilySlug = mediaFamily.getSlug();
            const mediaFamilyName = mediaFamily.getName();
            media = {
                id: media.getId(),
                name: media.getName(),
                date: media.getDate(),
                slug: media.getSlug(),
                sectionSlug: media.getSection().getSlug(),
                familySlug: mediaFamilySlug,
                sectionName: media.getSection().getName(),
                familyName: mediaFamilyName
            }
        }

        this.render("diaporama.html.twig", {
            allUserFamilies,
            sectionsByFamily,
            family,
            section,
            media,
            referer: this.req.header('Referer')
        });
    }

    search = async () => {
        const {sectionId, familyId} = this.getDatas();
        const user = await <Promise<User>> this.getUser();
        const allUserFamilies: Array<Family> = <Array<Family>>user.getFamilies();

        let familyBySection = {};
        let sectionsByFamily = {};
        for (const family of allUserFamilies) {
            const sections: Array<Section> = await SectionRepository.findAllByFamilyId(<number>family.getId());
            sectionsByFamily[<number>family.getId()] = sections
            for (const section of sections) {
                familyBySection[<number>section.getId()] = family;
            }
        }

        if (familyId && !allUserFamilies.map(family => family.getId()).includes(familyId)) {
            return this.returnFailedError("Cette famille n'existe pas ou vous est inaccessible", true);
        }
        if (
            sectionId && (
                familyId == undefined ||
                !sectionsByFamily[familyId].map(section => section.getId()).includes(sectionId)
            )
        ) {
            return this.returnFailedError("La rubrique spécifiée n'existe pas", true);
        }
        let sectionIds: Array<number>;
        if (familyId) {
            if (sectionId) {
                sectionIds = [sectionId];
            } else {
                sectionIds = sectionsByFamily[familyId].map(section => section.getId());
            }
        } else {
            sectionIds = [];
            for (const familyId in sectionsByFamily) {
                sectionIds = [...sectionIds, ...sectionsByFamily[familyId].map(section => section.getId())];
            }
        }
        let pictures: any|Array<Media> = await MediaRepository.findForDiaporama(sectionIds);

        if (pictures.length == 0) {
            return this.returnFailedError("Aucune image trouvée", true)
        }
        if (pictures.length == 1) {
            return this.returnFailedError("On ne peut faire de diaporama avec une seule image", true)
        }
        pictures = pictures.map((picture: Media) => {
            return {
                id: picture.getId(),
                name: picture.getName(),
                date: Helpers.formatDate(<Date>picture.getDate()),
                slug: picture.getSlug(),
                sectionSlug: (<Section>picture.getSection()).getSlug(),
                familySlug: familyBySection[<number>(<Section>picture.getSection()).getId()].getSlug(),
                sectionName: (<Section>picture.getSection()).getName(),
                familyName: familyBySection[<number>(<Section>picture.getSection()).getId()].getName()
            };
        })

        this.res.json({status: "success", pictures});

    }

    returnFailedError(value: string, json = false) {
        if (json) {
            this.res.json({status: "failed", error: value});
        } else {
            this.setFlash("failed", value);
            this.redirectToRoute("index");
        }
    }
}