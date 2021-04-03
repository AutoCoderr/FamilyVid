import Family from "../Entities/Family";
import Controller from "../Core/Controller";
import User from "../Entities/User";

export default class FamilyCheckService {
    static checkFamily(family: Family, controller: Controller, json = false) {
        if (family == null) {
            if (json) {
                controller.res.json({error: "Cette famille n'existe pas"});
            } else {
                controller.setFlash("access_family_failed", "Cette famille n'existe pas");
                controller.redirectToRoute("index");
            }
            return false;
        }

        let found = false;
        for (const user of <Array<User>>family.getUsers()) {
            if (user.getId() == controller.req.session.user.id) {
                found = true;
                break;
            }
        }
        if (!found) {
            if (json) {
                controller.res.json({error: "Vous ne faites pas partie de cette famille"});
            } else {
                controller.setFlash("access_family_failed", "Vous ne faites pas partie de cette famille");
                controller.redirectToRoute("index");
            }
            return false;
        }
        return true;
    }
}
