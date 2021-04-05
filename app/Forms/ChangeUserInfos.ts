import Helpers from "../Core/Helpers";

export default function ChangeUserInfos(){
    return {
        config: {
            action: Helpers.getPath("user_me"),
            method: "POST",
            submit: "Modifier",
            actionName: "change_user_info",
            msgError: "Modification échouée"
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
        }
    }
}