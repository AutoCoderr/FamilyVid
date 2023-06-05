import Helpers from "../Core/Helpers";
import env from "../Core/env";
import FileUploadService from "../Services/FileUploadService";
import MediaEntity from "../Entities/Media";
import User from "../Entities/User";
import Section from "../Entities/Section";

export default function Media(familySlug,section: Section, media: null|MediaEntity = null, userId: number) {
	let fileMimes: Array<string> = [];
	for (const type in FileUploadService.mediaTypeByMimeType) {
		fileMimes = [...fileMimes, ...FileUploadService.mediaTypeByMimeType[type]];
	}

	return {
		config: {
			action: media == null ? Helpers.getPath("media_new", {familySlug,sectionSlug: section.getSlug()}) : Helpers.getPath("media_edit", {familySlug,sectionSlug: section.getSlug(),mediaSlug: media.getSlug()}),
			method: "POST",
			submit: media == null ? "Ajouter" : "Modifier",
			actionName: media == null ? "create_media" : "edit_media",
			msgError: "Erreur lors de "+(media == null ? "l'ajout" : "la modification")+" du media",
			submitClass: "btn",
			formData: true,
			entity: MediaEntity,
			...(media != null ? {entityInstance: media} : {})
		},
		fields: {
			...(media == null ? {
				file: {
					type: "file",
					mimes: fileMimes,
					max_size: env.UPLOAD_SIZE_LIMIT,
					label: "Envoyez votre photo/vidéo",
					description: "Formats vidéo acceptés : MP4, OGG/OGV, WEBM",
					required: true,
					msgError: "Le vidéo n'est pas au bon format, ou fait plus de 1.5 giga octets"
				},
				fileExtension: {
					depend_on: "file",
					type: "param",
					required: true,
					set: (_,datas) => datas.file.name.split(".").slice(-1)[0]
				},
				type: {
					depend_on: "file",
					type: "param",
					required: true,
					set: (_,datas) => {
						for (const mediaType in FileUploadService.mediaTypeByMimeType) {
							if (FileUploadService.mediaTypeByMimeType[mediaType].includes(datas.file.mimetype)) {
								return mediaType;
							}
						}
					}
				},
				user: {
					type: "param",
					required: true,
					value: userId,
					entity: User
				},
				section: {
					type: "param",
					required: true,
					entity: Section,
					value: section
				},
				nbViews: {
					type: "param",
					required: true,
					value: 0
				}
			} : {}),
			name: {
				type: "text",
				label: "Son nom (*Si non renseigné, correspondra au nom du fichier)",
				required: media != null,
				maxLength: 50,
				minLength: 2,
				msgError: "Le nom doit faire de 2 à 50 caractères",
				...(media == null ? {
					depend_on: "file",
					set: (name,datas) => {
						const splitFilename = datas.file.name.split(".");
						const filename = splitFilename.slice(0,splitFilename.length-1).join(".");
						return name === "" ? filename : name;
					}
				} : {})
			},
			date: {
				type: "date",
				label: "Date : (ex: 1998-04-14 ou 2000-01-01)",
				required: true,
				msgError: "Vous devez spécifier une date"
			},
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
