import Controller from "../Core/Controller";
import FamilyRepository from "../Repositories/FamilyRepository";
import User from "../Entities/User";
import Family from "../Entities/Family";

export default class SectionController extends Controller {
    index = async () => {
        const {familyId} = this.req.params;

        const family: Family = await FamilyRepository.findOne(familyId);

        if (family == null) {
            this.setFlash("show_family_failed", "Cette famille n'existe pas");
            this.redirectToRoute("index");
            return;
        }

        let found = false;
        for (const user of <Array<User>>family.getUsers()) {
            if (user.getId() == this.req.session.user.id) {
                found = true;
                break;
            }
        }
        if (!found) {
            this.setFlash("show_family_failed", "Vous ne faites pas partie de cette famille");
            this.redirectToRoute("index");
            return;
        }

        this.render("section/list.html.twig", {family});
    }
}
