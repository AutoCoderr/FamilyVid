import Controller from "../Core/Controller";
import FamilyForm from "../Forms/Family";
import Validator from "../Core/Validator";
import Family from "../Entities/Family";

export default class FamilyController extends Controller {
    new = async () => {
        let formFamily = FamilyForm();
        let validator = new Validator(this.req,formFamily);

        if (validator.isSubmitted()) {
            if (validator.isValid()) {
                const datas = this.getDatas();

                let family = new Family();
                family.setName(datas.name);

                await family.save();

                const user = await this.getUser();
                await user.addFamily(family, datas.visible != undefined);

                this.req.session.user = await user.serialize();

                this.redirectToRoute("index");
            } else {
                this.redirectToRoute("family_new")
            }
            return;
        }

        this.render("family/new.html.twig", {formFamily});
    }


}
