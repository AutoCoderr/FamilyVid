import Helpers from "../Core/Helpers";
import Section from "../Entities/Section";
import SectionRepository from "../Repositories/SectionRepository";

export default async function DeplaceMedia(familyId, sectionId, mediaId) {
    let options: any = {};
    const sections: Array<Section> = await SectionRepository.findAllByFamilyIdExceptOne(familyId,sectionId);
    for (const section of sections) {
        options[<number>section.getId()] = section.getName();
    }
    return {
        config: {
            action: Helpers.getPath("media_edit", {familyId,sectionId,mediaId}),
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
