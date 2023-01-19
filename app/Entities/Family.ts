import EntityManager from "../Core/EntityManager";
import FamilyModel from "../Models/Family";
import User from "./User";

export default class Family extends EntityManager {

    Model = FamilyModel;

    name: null|string = null;

    Users: null|Array<User> = [];

    setName(name: string) {
        this.name = name;
    }
    getName() {
        return this.name;
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

    async addUser(user: User) {
        if (this.ModelInstance != null && user.ModelInstance != null) { // @ts-ignore
            await this.ModelInstance.addUser(user.ModelInstance)
        }
    }

}