import Controller from "../Core/Controller";
import User from "../Entities/User";

export default class FrontController extends Controller {
    index = async () => {
        if (this.req.session.user != undefined) {
            this.req.session.user = await (await <Promise<User>>this.getUser()).serialize();
        }
        this.render("index.html.twig");
    }
}

function rand(a,b) {
    return a+Math.floor(Math.random()*(b-a+1));
}
