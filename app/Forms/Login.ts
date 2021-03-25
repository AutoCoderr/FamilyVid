import Helpers from "../Core/Helpers";

export default function Login() {
	return {
		config: {
			action: Helpers.getPath("test_login"),
			method: "POST",
			submit: "Se connecter",
			actionName: "login",
			msgError: "Connexion échouée"
		},
		fields: {
			email: {
				type: "email",
				label: "Votre adresse mail",
				required: true,
				maxLength: 50,
				minLength: 3,
				msgError: "Format d'email incorrect"
			},
			password: {
				type: "password",
				label: "Votre mot de passe",
				required: true,
				msgError: "Format de mot de passe incorrect",
				checkValid: false
			}
		}
	}
};
