import Controller from "../Core/Controller";
import FamilyForm from "../Forms/Family";
import Validator from "../Core/Validator";
import Family from "../Entities/Family";
import UserRepository from "../Repositories/UserRepository";
import FamilyDemandForm from "../Forms/FamilyDemand";
import FamilyDemand from "../Entities/FamilyDemand";
import FamilyRepository from "../Repositories/FamilyRepository";
import FamilyDemandRepository from "../Repositories/FamilyDemandRepository";

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

    list = async () => {
        let id = this.req.params.id;
        let user = await UserRepository.findOne(id);

        user = await user.serialize();
        user.Families = user.Families.filter((family) => family.visible);

        let forms = {};
        for (let family of user.Families) {
            forms[family.id] = FamilyDemandForm(user.id,family.id);
        }

        this.render("family/list.html.twig", {user, forms})
    }

    demand = async () => {
        const { userId, familyId } = this.req.params;
        let datas = this.getDatas();

        let applicant = await this.getUser();
        let user = await UserRepository.findOne(userId);
        let family = await FamilyRepository.findOne(familyId);

        if (user == null || family == null) {
            this.setFlash("family_demand_failed","L'utilisateur ou la famille spécifiée n'existent pas");
            this.redirect(this.req.header('Referer'));
            return;
        }

        let demand = await FamilyDemandRepository.findByApplicantIdUserIdAndFamilyId(applicant.getId(),userId,familyId);
        if (demand != null) {
            this.setFlash("family_demand_failed","Vous avez déjà demandé à "+user.getFirstname()+" "+user.getLastname()+" de rentrer dans la famille "+family.getName());
            this.redirect(this.req.header('Referer'));
            return;
        }

        let familyDemand = new FamilyDemand();
        familyDemand.setApplicant(applicant);
        familyDemand.setFamily(family);
        familyDemand.setUser(user);
        familyDemand.setVisible(datas.visible != undefined);
        await familyDemand.save();

        this.setFlash("family_demand_success","Votre demande a été envoyée!");

        this.redirect(this.req.header('Referer'));
    }


}
