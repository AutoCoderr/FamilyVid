import EntityManager from "../Core/EntityManager";
import Exemplaire from "./Exemplaire";
import ProduitModel from "../Models/Produit";

export default class Produit extends EntityManager {

    ModelInstance = ProduitModel

    name: null|string = null;
    description: null|string = null;
    units: null|number = null;

    Exemplaires: null|Array<Exemplaire> = null;


    setId(id: number) {
        this.id = id;
    }
    getId() {
        return this.id;
    }

    setName(name: string) {
        this.name = name.trim();
    }
    getName() {
        return this.name;
    }

    setDescription(description: string) {
        this.description = description.trim();
    }
    getDescription() {
        return this.description;
    }

    setUnits(units: number) {
        this.units = units;
    }
    getUnits() {
        return this.units;
    }

    getExemplaires() {
        return this.Exemplaires;
    }

}
