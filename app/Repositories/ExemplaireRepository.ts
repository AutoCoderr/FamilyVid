import ExemplaireModel from "../Models/Exemplaire";
import ProduitModel from "../Models/Produit";
import Exemplaire from "../Entities/Exemplaire";
import RepositoryManager from "../Core/RepositoryManager";

export default class ExemplaireRepository extends RepositoryManager {
    static model = ExemplaireModel;
    static entity = Exemplaire;

    static async findByUserId(id) {
        return await super.findAllByParams({
            where: {
                UserId: id
            },
            include: ProduitModel
        })
    }
}
