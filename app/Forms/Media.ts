import Helpers from "../Core/Helpers";

export default function Media(familySlug,sectionSlug, mediaSlug = null) {
	return {
		config: {
			action: mediaSlug == null ? Helpers.getPath("media_new", {familySlug,sectionSlug}) : Helpers.getPath("media_edit", {familySlug,sectionSlug,mediaSlug}),
			method: "POST",
			submit: mediaSlug == null ? "Ajouter" : "Modifier",
			actionName: mediaSlug == null ? "create_media" : "edit_media",
			msgError: "Erreur lors de "+(mediaSlug == null ? "l'ajout" : "la modification")+" du media",
			formClass: "form-btn",
			submitClass: "btn",
			formData: true
		},
		fields: {
			name: {
				type: "text",
				label: "Son nom (*Si non renseigné, correspondra au nom du fichier)",
				required: false,
				msgError: "Le nom doit faire de 2 à 50 caractères"
			},
			date: {
				type: "date",
				label: "Date : (ex: 1998-04-14 ou 2000-01-01)",
				required: true,
				msgError: "Vous devez spécifier une date"
			},
			...(mediaSlug == null ? {
				file: {
					type: "file",
					mimes: ['video/mp4','video/ogg','video/x-msvideo','image/png','image/jpeg','image/bmp'],
					label: "Envoyez votre photo/vidéo",
					required: false,
					msgError: "Vous devez envoyer un fichier image ou vidéo"
				}
			} : {})
		}
	}
};
