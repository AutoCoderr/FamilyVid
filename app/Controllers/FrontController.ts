import Controller from "../Core/Controller";

export default class FrontController extends Controller {
    index = async () => {
        this.render("index.html.twig");
    }
}

function rand(a,b) {
    return a+Math.floor(Math.random()*(b-a+1));
}
