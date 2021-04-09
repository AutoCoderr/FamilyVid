import Helpers from "../Core/Helpers";
import Section from "../Entities/Section";
import SectionRepository from "../Repositories/SectionRepository";
import Family from "../Entities/Family";

export default async function DeplaceMedia(family: Family, sectionId, mediaId) {
    let options: any = {};
    const sections: Array<Section> = await SectionRepository.findAllByFamilyIdExceptOne(family.getId(),sectionId);
    for (const section of sections) {
        options[<number>section.getId()] = section.getName();
    }
    return {
        config: {
            action: Helpers.getPath("media_edit", {familySlug: family.getSlug(),sectionId,mediaId}),
            method: "POST",
            submit: "Déplacer",
            actionName: "deplace_media",
            msgError: "Déplacement échoué",
            formClass: "form-btn",
            submitClass: "btn"
        },
        fields: {
            section: {
                label: "Déplacer la photo/vidéo vers",
                type: "select",
                options: options,
                entity: Section.name,
                msgError: "Cette rubrique n'existe pas"
            },
        }
    }
}