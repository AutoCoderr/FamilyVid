import EntityManager from "../Core/EntityManager";
import User from "./User";
import AccountConfirmationModel from "../Models/Confirmation";

export default class Confirmation extends EntityManager {

    Model = AccountConfirmationModel;

    token: null|string = null;
    type: null|string = null; // account or password

    User: null|User = null;

    UserId: null|number = null;

    getToken() {
        return this.token;
    }
    setToken(token: string) {
        this.token = token;
    }

    getType() {
        return this.type;
    }
    setType(type: string) {
        this.type = type;
    }

    setUser(user: User) {
        this.User = user;
        this.UserId = user.getId();
    }
    getUser() {
        if (!(this.User instanceof User) && this.User != null) {
            this.User = (new User()).hydrate(this.User);
        }
        return this.User;
    }

}
