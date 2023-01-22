import {Model} from "sequelize";
import Helpers from "./Helpers";

export default class EntityManager {
    Model: null|typeof Model = null;
    ModelInstance: null|Model = null;
    id: null|number = null;

    setId(id) {
        this.id = id;
    }
    getId() {
        return this.id;
    }

    constructor() {
    }

    hydrate(entry: any) {
        for (let attr in entry.dataValues) {
            if (typeof(this[attr]) != "undefined") {
                this[attr] = entry.dataValues[attr];
            }
        }
        this.ModelInstance = entry;
        return this;
    }


    async save() {
        const entryObject: any = await this.serialize(true);

        if (this.id == null) {
            let entry;
            try {// @ts-ignore
                entry = await this.Model.create(entryObject);
            } catch(e) {
                throw e;
            }
            this.id = entry.dataValues.id;
            this.ModelInstance = entry;
            return this;
        } else {
            let entry
            try {// @ts-ignore
                entry = await this.Model.findOne({where: {id: this.id}});
            } catch(e) {
                throw e;
            }
            for (let attr in entryObject) {
                entry[attr] = this[attr];
            }
            entry.save();
            this.ModelInstance = entry;
            return this;
        }
    }

    async delete() {
        try { // @ts-ignore
            await this.Model.destroy({
                where: {
                    id: this.id
                }
            });
        } catch (e) {
            return false;
        }
        return true;
    }

    async serialize(forSaving = false) {
        let entryObject: any = {};
        for (let attr in this) {
            if (typeof(this[attr]) != "function" && attr != "Model" && attr != "ModelInstance" && (!forSaving || (forSaving && attr != "id"))) {
                let elem;
                if (typeof(this["get"+Helpers.ucFirst(attr)]) == "function" && !forSaving) {
                    elem = await this["get"+Helpers.ucFirst(attr)]();
                } else {
                    elem = this[attr];
                }

                if (elem instanceof Array && !forSaving && attr != "roles") {
                    entryObject[attr] = [];
                    for (let subElem of elem) {
                        if (subElem instanceof EntityManager) {
                            entryObject[attr].push(await subElem.serialize(forSaving));
                        } else if (typeof(subElem.dataValues) != "undefined") {
                            entryObject[attr].push(await subElem.dataValues);
                        }
                    }
                } else if(!(elem instanceof Array) || attr == "roles") {
                    if (elem instanceof EntityManager) {
                        entryObject[attr] = await elem.serialize(forSaving);
                    } else if (typeof(elem) == "object" && elem != null && typeof(elem.dataValues) != "undefined") {
                        entryObject[attr] = elem.dataValues;
                    } else {
                        entryObject[attr] = elem;
                    }
                }
            }
        }
        return entryObject;
    }
}

function addMissingZero(number: string|number, n: number = 2) {
    number = number.toString();
    while (number.length < n) {
        number = "0"+number;
    }
    return number
}
