import Family from "../Entities/Family";
import Controller from "../Core/Controller";
import User from "../Entities/User";
import Section from "../Entities/Section";
import SectionRepository from "../Repositories/SectionRepository";
import FamilyRepository from "../Repositories/FamilyRepository";
import Media from "../Entities/Media";
import MediaRepository from "../Repositories/MediaRepository";

export default class CheckService {
    static checkFamily(family: Family, controller: Controller, json = false) {
        if (family == null) {
            if (json) {
                controller.res.json({error: "Cette famille n'existe pas"});
            } else {
                controller.setFlash("access_family_failed", "Cette famille n'existe pas");
                controller.redirectToRoute("index");
            }
            return false;
        }

        let found = false;
        for (const user of <Array<User>>family.getUsers()) {
            if (user.getId() == controller.req.session.user.id) {
                found = true;
                break;
            }
        }
        if (!found) {
            if (json) {
                controller.res.json({error: "Vous ne faites pas partie de cette famille"});
            } else {
                controller.setFlash("access_family_failed", "Vous ne faites pas partie de cette famille");
                controller.redirectToRoute("index");
            }
            return false;
        }
        return true;
    }

    static async checkSectionAndFamily(familyId: number, sectionId: number, controller: Controller, json = false) {
        const section: null|Section = await SectionRepository.findOne(sectionId);
        if (section == null) {
            if (json) {
                controller.res.json({error: "Cette rubrique n'existe pas"})
            } else {
                controller.setFlash("section_failed", "Cette rubrique n'existe pas");
                controller.redirectToRoute("section_index", {familyId});
            }
            return false;
        }
        const family: Family = await FamilyRepository.findOne((<Family>section.getFamily()).getId());

        return this.checkFamily(family,controller, json) ? {family,section} : false;
    }

    static async checkMediaAndFamily(familyId: number, sectionId: number, mediaId: number, controller: Controller, json = false) {
        const media: null|Media = await MediaRepository.findOne(mediaId);
        if (media == null) {
            if(json) {
                controller.res.json({error: "Cette photo/vidéo n'existe pas"});
            } else {
                controller.setFlash("media_failed", "Cette photo/vidéo n'existe pas");
                controller.redirectToRoute("media_index", {familyId, sectionId})
            }
            return false;
        }

        const section: Section = <Section>media.getSection();

        // Get family by repository, to get other relations entity (the users)
        const family = await <Promise<Family>>FamilyRepository.findOne(section.getFamilyId());

        return this.checkFamily(family,controller, json) ? {family,section,media} : false;
    }
}
