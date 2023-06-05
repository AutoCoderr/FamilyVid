import Helpers from "../Core/Helpers";
import User from "../Entities/User";

export default function Register() {
	return {
		config: {
			action: Helpers.getPath("security_register"),
			method: "POST",
			submit: "S'inscrire",
			actionName: "register",
			msgError: "Erreur lors de l'inscription",
			formClass: "form-btn",
			submitClass: "btn",
			entity: User
		},
		fields: {
			firstname: {
				type: "text",
				label: "Votre prénom",
				required: true,
				maxLength: 50,
				minLength: 2,
				msgError: "Le prénom doit faire de 2 à 50 caractères"
			},
			lastname: {
				type: "text",
				label: "Votre nom",
				required: true,
				maxLength: 50,
				minLength: 2,
				msgError: "Le nom doit faire de 2 à 50 caractères"
			},
			email: {
				type: "email",
				label: "Votre adresse mail",
				required: true,
				maxLength: 50,
				minLength: 3,
				msgError: "Format d'email incorrect",
				uniq: {table: "User", column: "email", msgError: "Compte déjà existant", where: {active: true}}
			},
			password: {
				type: "password",
				label: "Votre mot de passe",
				minLength: 8,
				required: true,
				msgError: "Format de mot de passe incorrect",
				canDisplay: true,
				description: "Doit respecter une certaine compléxité :<br/>"+
							 "- Au moins 10 caractères<br/>"+
							 "- Au moins une majuscule<br/>"+
							 "- Au moins une miniscule<br/>"+
							 "- Au moins un chiffre<br/>"+
							 "- Au moins un caractère spécial (!~\"'()`?/.^*@$%_-#&<>§:;,)"
			},
			passwordConfirm: {
				type: "password",
				label: "Veuillez confirmer votre mot de passe",
				confirmWith: "password",
				required: true,
				canDisplay: true,
				msgError: "Les mots de passe ne correspondent pas"
			},
			active: {
				type: "param",
				value: false,
				required: true
			},
			roles: {
				type: "param",
				value: ['USER'],
				required: true
			}
		}
	}
};
