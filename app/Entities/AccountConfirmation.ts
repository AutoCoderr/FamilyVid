import EntityManager from "../Core/EntityManager";
import User from "./User";
import AccountConfirmationModel from "../Models/AccountConfirmation";

export default class AccountConfirmation extends EntityManager {

    Model = AccountConfirmationModel;

    token: null|string = null;

    User: null|User = null;

    UserId: null|number = null;

    getToken() {
        return this.token;
    }
    setToken(token: string) {
        this.token = token;
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
