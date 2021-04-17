import Helpers from "../Core/Helpers";
import Section from "../Entities/Section";
import SectionRepository from "../Repositories/SectionRepository";
import Family from "../Entities/Family";

export default async function DeplaceSectionMediasAndDelete(family: Family, section: Section) {
    let options: any = {};
    const sections: Array<Section> = await SectionRepository.findAllByFamilyIdExceptOne(family.getId(),section.getId());
    for (const section of sections) {
        options[<number>section.getId()] = section.getName();
    }
    return {
        config: {
            action: Helpers.getPath("section_delete_with_media", {familySlug: family.getSlug(),sectionSlug: section.getSlug()}),
            method: "POST",
            submit: "Déplacer et supprimer",
            actionName: "deplace_section_medias_and_delete",
            msgError: "Déplacement échoué",
            confirmOnSubmit: "Toutes les photos/vidéos seront déplacés vers la nouvelle rubrique, et celle ci sera supprimée",
            formClass: "form-btn",
            submitClass: "btn"
        },
        fields: {
            section: {
                label: "Déplacer les photos/vidéos vers",
                type: "select",
                options: options,
                entity: Section.name,
                msgError: "Cette rubrique n'existe pas"
            },
        }
    }
}
