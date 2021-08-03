import Helpers from "../Core/Helpers";
import EntityManager from "../Core/EntityManager";
import UserModel from "../Models/User";
import Family from "./Family";
import Comment from "./Comment";

export default class User extends EntityManager {

    Model = UserModel;

    entityTypes = {
        Families: Family.name,
        Comments: Comment.name
    }

    email: null|string = null;
    firstname: null|string = null;
    lastname: null|string = null;
    roles: null|string = null;
    password: null|string = null;
    active: null|boolean = null;

    Families: null|Array<Family> = [];
    Comments: null|Array<Comment> = [];


    setEmail(email: string) {
        this.email = email;
    }
    getEmail() {
        return Helpers.escapeHtml(this.email);
    }

    setFirstname(firstname: string) {
        this.firstname = firstname.trim();
    }
    getFirstname() {
        return Helpers.escapeHtml(this.firstname);
    }

    setLastname(lastname: string) {
        this.lastname = lastname.trim();
    }
    getLastname() {
        return Helpers.escapeHtml(this.lastname);
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
    removeRole(roleToRemove: string) {
        if (this.roles != null) {
            this.roles = JSON.stringify(
                JSON.parse(this.roles)
                    .filter(role => role != roleToRemove)
            );
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

    setActive(active: boolean) {
        this.active = active;
    }
    getActive() {
        return this.active;
    }

    getFamilies() {
        if (this.Families instanceof Array) {
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

    getComments() {
        if (this.Comments instanceof Array) {
            this.Comments.sort((A,B) => {
                return (<Date>A.getCreatedAt()).getTime() - (<Date>B.getCreatedAt()).getTime()
            });
        }
        return this.Comments
    }

}
