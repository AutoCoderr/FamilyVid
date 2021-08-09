import {Model, Op} from "sequelize";
import Helpers from "./Helpers";

export default class EntityManager {
    Model: null|typeof Model = null;
    ModelInstance: null|Model = null;
    id: null|number = null;

    entityTypes = {};

    setId(id) {
        this.id = id;
    }
    getId() {
        return this.id;
    }

    async setSlugFrom(column, params = {}) {
        if (typeof(this[column]) == "undefined" || typeof(this['slug']) == "undefined" ) return null;
        let slug = this[column].toLowerCase();

        const replaces = {
            '-': [" ","'",'"',"`",",","\\","/",":","*","?","<",">","|"],
            "a": ["à","â","ä","ã"],
            "e": ["é","è","ê","ë"],
            "c": ["ç"],
            "u": ["ù","û","ü"],
            "o": ["ô","ö","õ"],
        }

        for (const replace in replaces) {
            const toReplaces = replaces[replace];
            for (const toReplace of toReplaces) {
                slug = Helpers.replaceAll(slug,toReplace,replace);
            }
        }
        let nb = 0;
        let found;
        do {
            nb += 1;// @ts-ignore
            found = await this.Model.findOne({
                where: {
                    slug: slug+(nb > 1 ? "-"+nb : ""),
                    ...(this.id != null ? { id: {[Op.ne]: this.id} } : {}),
                    ...params
                }
            });
        } while (found != null);

        this['slug'] = slug+(nb > 1 ? "-"+nb : "");
    }

    constructor() {
    }

    hydrate(entry: any) {
        for (let attr in entry.dataValues) {
            if (typeof(this[attr]) != "undefined") {
                if (typeof(entry.dataValues[attr]) == "object" && entry.dataValues[attr] != null && !(entry.dataValues[attr] instanceof Date)) {
                    const entityName = this.entityTypes[attr] ? this.entityTypes[attr] : attr;
                    const entity = require("../Entities/"+entityName).default;
                    if (entry.dataValues[attr] instanceof Array) {
                        this[attr] = entry.dataValues[attr].map(elem => {
                            return (new entity()).hydrate(elem);
                        });
                    } else {
                        this[attr] = (new entity()).hydrate(entry.dataValues[attr]);
                    }
                } else {
                    this[attr] = entry.dataValues[attr];
                }
            }
        }
        this.ModelInstance = entry;
        return this;
    }


    async save() {
        if (this.id == null) {
            let entry;
            try {// @ts-ignore
                entry = await this.Model.create(this);
            } catch(e) {
                throw e;
            }
            this.id = entry.dataValues.id;
            this.ModelInstance = entry;
            return this;
        } else {
            for (let attr in this) {
                if (attr != "Model" && attr != "ModelInstance" && attr != "entityTypes") { // @ts-ignore
                    this.ModelInstance[attr] = this[attr];
                }
            }// @ts-ignore
            await this.ModelInstance.save();
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

    async serialize() {
        let entryObject: any = {};
        for (let attr in this) {
            if (typeof(this[attr]) != "function" && attr != "Model" && attr != "ModelInstance" && attr != "entityTypes") {
                let elem;
                if (typeof(this["get"+Helpers.ucFirst(attr)]) == "function") {
                    elem = await this["get"+Helpers.ucFirst(attr)]();
                } else {
                    elem = this[attr];
                }

                if (elem instanceof Array && attr != "roles") {
                    entryObject[attr] = [];
                    for (let subElem of elem) {
                        if (subElem instanceof EntityManager) {
                            entryObject[attr].push(await subElem.serialize());
                        } else if (typeof(subElem.dataValues) != "undefined") {
                            entryObject[attr].push(await subElem.dataValues);
                        }
                    }
                } else if (elem instanceof EntityManager) {
                    entryObject[attr] = await elem.serialize();
                } else if (typeof(elem) == "object" && elem != null && typeof(elem.dataValues) != "undefined") {
                    entryObject[attr] = elem.dataValues;
                } else {
                    entryObject[attr] = elem;
                }
            }
        }
        return entryObject;
    }
}
