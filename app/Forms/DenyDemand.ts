import Helpers from "../Core/Helpers";

export default function DenyDemand(demandId) {
    return {
        config: {
            action: Helpers.getPath("family_deny_demand", {id: demandId}),
            method: "POST",
            submit: "Refuser",
            actionName: "deny_demand",
            msgError: "Refus échoué",
            formClass: "form-btn",
            submitClass: "btn"
        }
    }
}
