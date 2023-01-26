import Helpers from "../Core/Helpers";

export default function Media(familyId,sectionId, mediaId = null) {
	return {
		config: {
			action: mediaId == null ? Helpers.getPath("media_new", {familyId,sectionId}) : Helpers.getPath("media_edit", {familyId,sectionId,mediaId}),
			method: "POST",
			submit: mediaId == null ? "Ajouter" : "Modifier",
			actionName: mediaId == null ? "create_media" : "edit_media",
			msgError: "Erreur lors de "+(mediaId == null ? "l'ajout" : "la modification")+" du media"
		},
		fields: {
			name: {
				type: "text",
				label: "Son nom (*Si non renseigné, correspondra à la date)",
				required: false,
				msgError: "Le nom doit faire de 2 à 50 caractères"
			},
			date: {
				type: "date",
				label: "Date : (ex: 1998-04-14 ou 2000-01-01)",
				required: true,
				msgError: "Vous devez spécifier une date"
			},
			type: {
				type: "select",
				options: {
					video: 'Vidéo',
					picture: 'Photo'
				},
				label: "Photo ou vidéo?",
				required: true,
				msgError: "Photo ou vidéo?"
			}
		}
	}
};
