import Family from "../Entities/Family";
import Controller from "../Core/Controller";
import User from "../Entities/User";

export default class FamilyCheckService {
    static checkFamily(family: Family, controler: Controller) {
        if (family == null) {
            controler.setFlash("access_family_failed", "Cette famille n'existe pas");
            controler.redirectToRoute("index");
            return false;
        }

        let found = false;
        for (const user of <Array<User>>family.getUsers()) {
            if (user.getId() == controler.req.session.user.id) {
                found = true;
                break;
            }
        }
        if (!found) {
            controler.setFlash("access_family_failed", "Vous ne faites pas partie de cette famille");
            controler.redirectToRoute("index");
            return false;
        }
        return true;
    }
}
