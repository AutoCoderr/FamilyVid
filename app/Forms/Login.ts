import Helpers from "../Core/Helpers";

export default function Login() {
	return {
		config: {
			action: Helpers.getPath("security_login"),
			method: "POST",
			submit: "Se connecter",
			actionName: "login",
			msgError: "Connexion échouée",
			submitClass: "btn"
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
				canDisplay: true,
				msgError: "Format de mot de passe incorrect",
				checkValid: false
			}
		}
	}
};
