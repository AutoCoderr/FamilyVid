import Helpers from "../Core/Helpers";

export default function ForgotPassword() {
	return {
		config: {
			action: Helpers.getPath("security_forgot_password"),
			method: "POST",
			submit: "Envoyer",
			actionName: "forgot_password",
			msgError: "Changement du mot de passe échoué",
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
			}
		}
	}
};
