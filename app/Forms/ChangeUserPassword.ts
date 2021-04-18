import Helpers from "../Core/Helpers";

export default function ChangeUserPassword(confirmation_token = null) {
    return {
        config: {
            action: confirmation_token == null ? Helpers.getPath("user_me") : Helpers.getPath("security_new_password", {token: confirmation_token}),
            method: "POST",
            submit: "Changer",
            actionName: "change_user_password",
            msgError: "Erreur lors du changement de mot de passe",
            formClass: "form-btn",
            submitClass: "btn"
        },
        fields: {
            ...(confirmation_token == null ? {
                old_password: {
                    type: "password",
                    label: "Votre ancien mot de passe",
                    required: true,
                    checkValid: false,
                    canDisplay: true,
                    msgError: "Vous devez entrer votre ancien mot de passe"
                }
            } : {}),
            password: {
                type: "password",
                label: "Votre mot de passe",
                minLength: 8,
                required: true,
                canDisplay: true,
                msgError: "Format de mot de passe incorrect"
            },
            passwordConfirm: {
                type: "password",
                label: "Veuillez confirmer votre mot de passe",
                confirmWith: "password",
                required: true,
                canDisplay: true,
                msgError: "Les mots de passe ne correspondent pas"
            }
        }
    }
};
