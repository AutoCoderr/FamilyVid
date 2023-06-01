import Helpers from "../Core/Helpers";
import env from "../Core/env";
import FileUploadService from "../Services/FileUploadService";

export default function Media(familySlug,sectionSlug, mediaSlug = null) {
	let fileMimes: Array<string> = [];
	for (const type in FileUploadService.mediaTypeByMimeType) {
		fileMimes = [...fileMimes, ...FileUploadService.mediaTypeByMimeType[type]];
	}

	return {
		config: {
			action: mediaSlug == null ? Helpers.getPath("media_new", {familySlug,sectionSlug}) : Helpers.getPath("media_edit", {familySlug,sectionSlug,mediaSlug}),
			method: "POST",
			submit: mediaSlug == null ? "Ajouter" : "Modifier",
			actionName: mediaSlug == null ? "create_media" : "edit_media",
			msgError: "Erreur lors de "+(mediaSlug == null ? "l'ajout" : "la modification")+" du media",
			submitClass: "btn",
			formData: true
		},
		fields: {
			name: {
				type: "text",
				label: "Son nom (*Si non renseigné, correspondra au nom du fichier)",
				required: false,
				maxLength: 50,
				minLength: 2,
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
					mimes: fileMimes,
					max_size: env.UPLOAD_SIZE_LIMIT,
					label: "Envoyez votre photo/vidéo",
					description: "Formats vidéo acceptés : MP4, OGG/OGV, WEBM",
					required: true,
					msgError: "Le vidéo n'est pas au bon format, ou fait plus de 1.5 giga octets"
				}
			} : {}),
			tags: {
				type: "textarea",
				label: "Mots clés (optionel)",
				maxLength: 140,
				minLength: 2,
				required: false,
				msgError: "La liste des mot clé doit faire entre 2 et 140 caractères"
			}
		}
	}
};
