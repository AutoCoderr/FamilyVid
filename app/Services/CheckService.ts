import Family from "../Entities/Family";
import Controller from "../Core/Controller";
import User from "../Entities/User";
import Section from "../Entities/Section";
import SectionRepository from "../Repositories/SectionRepository";
import FamilyRepository from "../Repositories/FamilyRepository";
import Media from "../Entities/Media";
import MediaRepository from "../Repositories/MediaRepository";

export default class CheckService {
    static checkFamily(family: null|Family, controller: Controller, json = false) {
        if (family == null) {
            if (json) {
                controller.res.json({status: "failed", errors: ["Cette famille n'existe pas"]});
            } else {
                controller.setFlash("failed", "Cette famille n'existe pas");
                controller.redirectToRoute("index");
            }
            return false;
        }

        for (const user of <Array<User>>family.getUsers()) {
            if (user.getId() == controller.req.session.user.id) {
                return true;
            }
        }
        if (json) {
            controller.res.json({status: "failed", errors: ["Vous ne faites pas partie de cette famille"]});
        } else {
            controller.setFlash("failed", "Vous ne faites pas partie de cette famille");
            controller.redirectToRoute("index");
        }
        return false;
    }

    static async checkSectionAndFamily(familySlug: string, sectionSlug: string, controller: Controller, json = false) {
        const section: null|Section = await SectionRepository.findOneBySlug(sectionSlug);
        if (section == null) {
            if (json) {
                controller.res.json({status: "failed", errors: ["Cette rubrique n'existe pas"]})
            } else {
                controller.setFlash("section_failed", "Cette rubrique n'existe pas");
                controller.redirectToRoute("section_index", {familySlug});
            }
            return false;
        }
        const family: Family = await FamilyRepository.findOne((<Family>section.getFamily()).getId());

        return this.checkFamily(family,controller, json) ? {family,section} : false;
    }

    static async checkMediaAndFamily(familySlug: string, sectionSlug: string, mediaSlug: string, controller: Controller, json = false) {
        const media: null|Media = await MediaRepository.findOneBySlug(mediaSlug);
        if (media == null) {
            if(json) {
                controller.res.json({status: "failed", errors: ["Cette photo/vidéo n'existe pas"]});
            } else {
                controller.setFlash("media_failed", "Cette photo/vidéo n'existe pas");
                controller.redirectToRoute("media_index", {familySlug, sectionSlug})
            }
            return false;
        }

        const section: Section = <Section>media.getSection();

        // Get family by repository, to get other relations entity (the users)
        const family = await <Promise<Family>>FamilyRepository.findOne(section.getFamilyId());

        return this.checkFamily(family,controller, json) ? {family,section,media} : false;
    }
}
