import Helpers from "../Core/Helpers";

export default function AcceptDemand(demandId) {
    return {
        config: {
            action: Helpers.getPath("family_accept_demand", {id: demandId}),
            method: "POST",
            submit: "Accepter",
            actionName: "accept_demand_",
            msgError: "Acceptation échouée",
            formClass: "form-btn",
            submitClass: "btn"
        },
        fields: {
        }
    }
}
