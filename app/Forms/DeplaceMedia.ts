import Helpers from "../Core/Helpers";
import Section from "../Entities/Section";
import SectionRepository from "../Repositories/SectionRepository";
import Family from "../Entities/Family";
import Media from "../Entities/Media";

export default async function DeplaceMedia(family: Family, section: Section, media: Media) {
    let options: any = {};
    const sections: Array<Section> = await SectionRepository.findAllByFamilyIdExceptOne(family.getId(),section.getId());
    for (const section of sections) {
        options[<number>section.getId()] = section.getName();
    }
    return {
        config: {
            action: Helpers.getPath("media_edit", {familySlug: family.getSlug(),sectionSlug: section.getSlug(),mediaSlug: media.getSlug()}),
            method: "POST",
            submit: "Déplacer",
            actionName: "deplace_media",
            msgError: "Déplacement échoué",
            formClass: "form-btn",
            submitClass: "btn",
            entity: Media,
            entityInstance: media
        },
        fields: {
            section: {
                label: "Déplacer la photo/vidéo vers",
                type: "select",
                options: options,
                entity: Section,
                msgError: "Cette rubrique n'existe pas"
            },
        }
    }
}
