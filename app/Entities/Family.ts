import EntityManager from "../Core/EntityManager";
import FamilyModel from "../Models/Family";
import User from "./User";
import Section from "./Section";
import Helpers from "../Core/Helpers";

export default class Family extends EntityManager {

    Model = FamilyModel;

    entityTypes = {
        Users: User.name,
        Sections: Section.name
    }

    name: null|string = null;
    slug: null|string = null

    visible: null|boolean = null;

    Users: null|Array<User> = [];
    Sections: null|Array<Section> = [];

    async setName(name: string) {
        this.name = name;
        await this.setSlugFrom('name');
    }
    getName() {
        return Helpers.escapeHtml(this.name);
    }

    getSlug() {
        return this.slug;
    }

    getVisible() { // @ts-ignore
        if (this.visible == null && this.ModelInstance != null && this.ModelInstance.dataValues.User_Families != undefined) { // @ts-ignore
            this.visible = this.ModelInstance.dataValues.User_Families.dataValues.visible;
        }
        return this.visible;
    }

    async setVisible(visible) { // @ts-ignore
        if (this.visible == null && this.ModelInstance != null && this.ModelInstance.dataValues.User_Families != undefined) { // @ts-ignore
            this.ModelInstance.dataValues.User_Families.visible = visible; // @ts-ignore
            await this.ModelInstance.dataValues.User_Families.save()
        }
    }

    getUsers() {
        return this.Users;
    }

    async addUser(user: User, visible = true) {
        if (this.ModelInstance != null && user.ModelInstance != null) { // @ts-ignore
            await this.ModelInstance.addUser(user.ModelInstance, {through: { visible }});
            if (this.Users == null) {
                this.Users = [];
            }
            this.Users.push(user);
        }
    }

    getSections() {
        if (this.Sections instanceof Array) {
            this.Sections.sort((A, B) => {
                return (<string>A.getName()).toLowerCase() > (<string>B.getName()).toLowerCase() ? 1 : -1;
            });
        }
        return this.Sections;
    }

}
