import Helpers from "../Core/Helpers";
import EntityManager from "../Core/EntityManager";
import UserModel from "../Models/User";
import Family from "./Family";

export default class User extends EntityManager {

    Model = UserModel;

    email: null|string = null;
    firstname: null|string = null;
    lastname: null|string = null;
    roles: null|string = null;
    password: null|string = null;

    Families: null|Array<Family> = [];


    setEmail(email: string) {
        this.email = email;
    }
    getEmail() {
        return this.email;
    }

    setFirstname(firstname: string) {
        this.firstname = firstname.trim();
    }
    getFirstname() {
        return this.firstname;
    }

    setLastname(lastname: string) {
        this.lastname = lastname.trim();
    }
    getLastname() {
        return this.lastname;
    }

    addRole(role: string) {
        if (this.roles == null) {
            this.roles = "[]";
        }
        if (!JSON.parse(this.roles).includes(role)) {
            this.roles = JSON.stringify([...JSON.parse(this.roles), role])
        }
    }
    setRoles(roles: Array<string>) {
        this.roles = JSON.stringify(roles);
    }
    removeRole(role: string) {
        if (this.roles != null) {
            const roles = JSON.parse(this.roles);
            if (roles.includes(role)) {
                roles.splice(roles.indexOf(role),1);
            }
            this.roles = JSON.stringify(roles);
        }
    }
    getRoles() {
        return this.roles == null ? null : JSON.parse(this.roles);
    }

    setPassword(password: string) {
        this.password = Helpers.hashPassword(password);
    }
    getPassword() {
        return this.password;
    }

    getFamilies() {
        if (this.Families instanceof Array) {
            for (let i=0;i<this.Families.length;i++) {
                if (!(this.Families[i] instanceof Family)) {
                    this.Families[i] = (new Family()).hydrate(this.Families[i]);
                }
            }
            this.Families.sort((A,B) => {
               return (<string>A.getName()).toLowerCase() > (<string>B.getName()).toLowerCase() ? 1 : -1;
            });
        }
        return this.Families;
    }

    async addFamily(family: Family, visible = true) {
        if (this.ModelInstance != null && family.ModelInstance != null) { // @ts-ignore
            await this.ModelInstance.addFamily(family.ModelInstance, {through: { visible }});
            if (this.Families == null) {
                this.Families = [];
            }
            this.Families.push(family);
        }
    }

}
