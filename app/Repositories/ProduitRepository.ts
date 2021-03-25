import ProduitModel from "../Models/Produit";
import Produit from "../Entities/Produit";
import RepositoryManager from "../Core/RepositoryManager";
import ExemplaireModel from "../Models/Exemplaire";

export default class ProduitRepository extends RepositoryManager {
    static model = ProduitModel;
    static entity = Produit;

    static async findOne(id) {
        return await super.findOne(id,ExemplaireModel);
    }
}
