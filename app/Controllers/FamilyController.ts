import Controller from "../Core/Controller";
import FamilyForm from "../Forms/Family";
import Validator from "../Core/Validator";
import Family from "../Entities/Family";
import UserRepository from "../Repositories/UserRepository";
import FamilyDemandForm from "../Forms/FamilyDemand";
import FamilyDemand from "../Entities/FamilyDemand";
import FamilyRepository from "../Repositories/FamilyRepository";
import FamilyDemandRepository from "../Repositories/FamilyDemandRepository";
import User from "../Entities/User";

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

                const user = await <Promise<User>>this.getUser();
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
        let userId = this.req.params.userId;
        let user = await UserRepository.findOne(userId);

        user = await user.serialize();
        user.Families = user.Families.filter((family) => family.visible);

        let forms = {};
        for (let family of user.Families) {
            forms[family.id] = FamilyDemandForm(user.id,family.id);
        }

        this.render("family/list.html.twig", {user, forms})
    }

    list_mines = async () => {
        this.req.session.user = await (await <Promise<User>>this.getUser()).serialize();
        this.render("family/list_mines.html.twig");
    }

    change_display = async () => {
        const {id} = this.req.params;
        const me = await <Promise<User>>this.getUser();
        for (const family of <Array<Family>>me.getFamilies()) {
            if (family.getId() == id) {
                const datas = this.getDatas();
                await family.setVisible(datas.visible != undefined);
                this.setFlash("change_display_family_success", "La famille "+family.getName()+" sera "+(datas.visible != undefined ? "visible" : "invisible")+" pour les autres");
                this.redirect(this.req.header('Referer'));
                return;
            }
        }
        this.setFlash("change_display_family_failed", "Cette famille est introuvable");
        this.redirect(this.req.header('Referer'));
    }

    demand = async () => {
        let datas = this.getDatas();
        if (datas.user == undefined || datas.family == undefined) {
            this.setFlash("family_demand_failed",["La famille ou l'utilisateur à qui faire la demande n'ont pas été spécifiés"]);
            this.redirect(this.req.header('Referer'));
            return;
        }
        let familyDemandForm = FamilyDemandForm(datas.user,datas.family);
        let validator = new Validator(this.req,familyDemandForm);
        if (validator.isSubmitted()) {
            if (await validator.isValid()) {
                let applicant: User = await <Promise<User>>this.getUser();
                let user: User = await UserRepository.findOne(datas.user);
                let family: Family = await FamilyRepository.findOne(datas.family);

                for (const eachFamily of <Array<Family>>applicant.getFamilies()) {
                    if (eachFamily.getId() == family.getId()) {
                        this.setFlash("family_demand_failed",["Vous vous trouvez déjà dans la famille "+family.getName()]);
                        this.redirect(this.req.header('Referer'));
                        return;
                    }
                }

                let demand = await FamilyDemandRepository.findOneByApplicantIdUserIdAndFamilyId(applicant.getId(),datas.user,datas.family);
                if (demand != null) {
                    this.setFlash("family_demand_failed",["Vous avez déjà demandé à "+user.getFirstname()+" "+user.getLastname()+" de vous faire rentrer dans la famille "+family.getName()]);
                    this.redirect(this.req.header('Referer'));
                    return;
                }

                let familyDemand = new FamilyDemand();
                familyDemand.setApplicant(applicant);
                familyDemand.setFamily(family);
                familyDemand.setUser(user);
                familyDemand.setVisible(datas.visible != undefined);
                await familyDemand.save();

                this.setFlash("family_demand_success",["Votre demande a été envoyée!"]);
            } else {
                this.setFlash("family_demand_failed", this.req.session.flash.errors[familyDemandForm.config.actionName]);
                delete this.req.session.flash.errors[familyDemandForm.config.actionName];
            }
        }

        this.redirect(this.req.header('Referer'));
    }

    demands = async () => {
        let demands = await FamilyDemandRepository.findByUserId(this.req.session.user.id);

        this.render("family/demands.html.twig", {demands});
    }

    accept_demand = async () => {
        const {id} = this.req.params;

        const demand: FamilyDemand = await FamilyDemandRepository.findOne(id);

        if (this.checkDemand(demand)) {
            await (<User>demand.getApplicant()).addFamily(<Family>demand.getFamily(), <boolean>demand.getVisible());
            await demand.delete();

            this.setFlash("demand_success", "La demande a été acceptée avec succès!");
            this.redirect(this.req.header('Referer'));
        }
    }

    deny_demand = async () => {
        const {id} = this.req.params;

        const demand: FamilyDemand = await FamilyDemandRepository.findOne(id);

        if (this.checkDemand(demand)) {
            await demand.delete();

            this.setFlash("demand_success", "La demande a été refusée avec succès!");
            this.redirect(this.req.header('Referer'));
        }
    }

    checkDemand(demand: FamilyDemand) {
        if (demand == null) {
            this.setFlash("demand_error", "La demande en question n'existe pas");
            this.redirect(this.req.header('Referer'));
            return false;
        }

        if (demand.getApplicant() == null) {
            this.setFlash("demand_error", "Le demandeur est introuvable");
            this.redirect(this.req.header('Referer'));
            return false;
        }

        if (demand.getFamily() == null) {
            this.setFlash("demand_error", "Le famille en question n'existe pas");
            this.redirect(this.req.header('Referer'));
            return false;
        }
        return true;
    }


}
