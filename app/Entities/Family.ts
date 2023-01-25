import EntityManager from "../Core/EntityManager";
import FamilyModel from "../Models/Family";
import User from "./User";
import Section from "./Section";

export default class Family extends EntityManager {

    Model = FamilyModel;

    name: null|string = null;

    visible: null|boolean = null;

    Users: null|Array<User> = [];
    Sections: null|Array<Section> = [];

    setName(name: string) {
        this.name = name;
    }
    getName() {
        return this.name;
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
        if (this.Users instanceof Array) {
            for (let i=0;i<this.Users.length;i++) {
                if (!(this.Users[i] instanceof User)) {
                    this.Users[i] = (new User()).hydrate(this.Users[i]);
                }
            }
        }
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
            for (let i=0;i<this.Sections.length;i++) {
                if (!(this.Sections[i] instanceof Section)) {
                    this.Sections[i] = (new Section()).hydrate(this.Sections[i]);
                }
            }
            this.Sections.sort((A,B) => {
                return (<string>A.getName()).toLowerCase() > (<string>B.getName()).toLowerCase() ? 1 : -1;
            });
        }
        return this.Sections;
    }

}
