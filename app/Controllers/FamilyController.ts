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
import CheckService from "../Services/CheckService";
import DenyDemand from "../Forms/DenyDemand";
import AcceptDemand from "../Forms/AcceptDemand";
import FamilyChangeDisplay from "../Forms/FamilyChangeDisplay";
import Helpers from "../Core/Helpers";

export default class FamilyController extends Controller {
    new = async () => {
        let formFamily = FamilyForm();
        let validator = new Validator(this.req,formFamily);

        if (validator.isSubmitted()) {
            if (await validator.isValid()) {

                await validator.save();

                const family = <Family>validator.entity;
                const user = await <Promise<User>>this.getUser();
                await user.addFamily(family, validator.getDatas().visible);

                this.req.session.user = await user.serialize();

                this.redirectToRoute("index");
            } else {
                this.redirectToRoute("family_new")
            }
            return;
        }
        this.generateToken();
        this.render("family/new.html.twig", {formFamily});
    }

    list = async () => {
        let userId = this.req.params.userId;
        let user = await UserRepository.findOne(userId);

        user = await user.serialize();
        user.Families = user.Families.filter((family) => family.visible);

        let forms = {};
        for (let family of user.Families) {
            forms[family.id] = FamilyDemandForm(this.req.session.user.id,user.id,family.id);
        }
        this.generateToken();
        this.render("family/list.html.twig", {user, forms})
    }

    list_mines = async () => {
        const user: User = await <Promise<User>>this.getUser();
        this.req.session.user = await user.serialize();
        let forms = {};
        for (const family of <Array<Family>>user.getFamilies()) {
            const form = FamilyChangeDisplay(family);
            Helpers.hydrateForm(family,form);
            forms[<number>family.getId()] = form;
        }
        this.generateToken();
        this.render("family/list_mines.html.twig", {forms});
    }

    change_display = async () => {
        const {slug} = this.req.params;

        const me = await <Promise<User>>this.getUser();
        const family = (<Array<Family>>me.getFamilies()).find(family => family.getSlug() == slug);
        if (family) {
            const changeDisplayform = FamilyChangeDisplay(family);
            const validator = new Validator(this.req,changeDisplayform);
            if (validator.isSubmitted()) {
                if (await validator.isValid(false)) {
                    await validator.save();
                    this.setFlash("change_display_family_success", "La famille "+family.getName()+" sera "+(validator.getDatas().visible != undefined ? "visible" : "invisible")+" pour les autres");
                } else {
                    this.setFlash("change_display_family_failed", validator.getErrors()[0]);
                }
            }
            this.redirect(this.req.header('Referer'));
            return;
        }
        this.setFlash("change_display_family_failed", "Cette famille est introuvable");
        this.redirect(this.req.header('Referer'));
    }

    demand = async () => {
        let familyDemandForm = FamilyDemandForm(this.req.session.user.id);
        let validator = new Validator(this.req,familyDemandForm);
        if (validator.isSubmitted()) {
            if (await validator.isValid()) {

                await validator.save();

                this.setFlash("family_demand_success","Votre demande a été envoyée!");
            } else {
                this.setFlash("family_demand_faileds", this.req.session.flash.errors[familyDemandForm.config.actionName]);
                delete this.req.session.flash.errors[familyDemandForm.config.actionName];
            }
        }

        this.redirect(this.req.header('Referer'));
    }

    demands = async () => {
        let demands: Array<FamilyDemand> = await FamilyDemandRepository.findByUserId(this.req.session.user.id);
        let denyForms: any = {};
        let acceptForms: any = {};
        for (const demand of demands) {
            denyForms[<number>demand.getId()] = DenyDemand(demand.getId());
            acceptForms[<number>demand.getId()] = AcceptDemand(demand.getId());
        }
        this.generateToken();
        this.render("family/demands.html.twig", {demands,denyForms,acceptForms});
    }

    accept_demand = async () => {
        const {id} = this.req.params;

        const demand: FamilyDemand = await FamilyDemandRepository.findOne(id);

        if (this.checkDemand(demand)) {
            const acceptDemandForm = AcceptDemand(id);
            const validator = new Validator(this.req,acceptDemandForm);

            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    await (<User>demand.getApplicant()).addFamily(<Family>demand.getFamily(), <boolean>demand.getVisible());
                    await demand.delete();
                    this.setFlash("demand_success", "La demande a été acceptée avec succès!");
                } else {
                    this.setFlash("demand_error", this.req.session.flash.errors[acceptDemandForm.config.actionName][0])
                    delete this.req.session.flash.errors[acceptDemandForm.config.actionName];
                }
            }
            this.redirect(this.req.header('Referer'));
        }
    }

    deny_demand = async () => {
        const {id} = this.req.params;

        const demand: FamilyDemand = await FamilyDemandRepository.findOne(id);

        if (this.checkDemand(demand)) {
            const denyDemandForm = DenyDemand(id);
            const validator = new Validator(this.req,denyDemandForm);

            if (validator.isSubmitted()) {
                if (await validator.isValid()) {
                    await demand.delete();
                    this.setFlash("demand_success", "La demande a été refusée avec succès!");
                } else {
                    this.setFlash("demand_error", this.req.session.flash.errors[denyDemandForm.config.actionName][0])
                    delete this.req.session.flash.errors[denyDemandForm.config.actionName];
                }
            }
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

    members = async () => {
        const {slug} = this.req.params;

        let family: Family = await FamilyRepository.findOneBySlug(slug)

        if(CheckService.checkFamily(family,this)) {
            this.render("family/members.html.twig", {family});
        }
    }

    members_search = async () => {
        const {slug} = this.req.params;

        let family: Family = await FamilyRepository.findOneBySlug(slug);

        if(CheckService.checkFamily(family,this, true)) {
            const {search} = this.req.body;
            let users = (<Array<User>>family.getUsers())
                .filter(user => { // filter to get users which match with the search
                    return search == "" ||
                    (<string>user.getFirstname()).toLowerCase().replace(search.toLowerCase(),"") != (<string>user.getFirstname()).toLowerCase() ||
                    (<string>user.getLastname()).toLowerCase().replace(search.toLowerCase(),"") != (<string>user.getLastname()).toLowerCase() ||
                    (<string>user.getEmail()).toLowerCase().replace(search.toLowerCase(),"") != (<string>user.getEmail()).toLowerCase()
            })
                .map(user => {
                    return {
                        id: user.getId(),
                        firstname: user.getFirstname(),
                        lastname: user.getLastname(),
                        email: user.getEmail()
                    }
            });
            this.res.json(users);
        }
    }
}
