import {Model} from "sequelize";
import EntityManager from "./EntityManager";

export default class RepositoryManager {
    static model: null|typeof Model = null;
    static entity: null|typeof EntityManager = null;

    static async findOne(id, include: any = null, order: null|Array<Array<typeof Model|{model: typeof Model, as: string}|string>> = null) : Promise<any> {
        let params: any = {where: {id: id}};
        if (include != null) {
            params.include = include;
        }
        if (order != null) {
            params.order = order;
        }
        return await this.findOneByParams(params);
    }

    static findAll(include: null|typeof Model|Array<typeof Model|{model: typeof Model, as: string}> = null) {
        return this.findAllByParams({...(include != null ? {include} : {})});
    }

    static async findAllByParams(params, useEntity = true): Promise<any> {// @ts-ignore
        const elems = await this.model.findAll(params);
        for (let i=0;i<elems.length;i++) {// @ts-ignore
            elems[i] = useEntity ? new this.entity().hydrate(elems[i]) : this.getDataValuesRec(elems[i]);
        }
        return elems;
    }

    static async findOneByParams(params, useEntity = true): Promise<any> {// @ts-ignore
        const foundElem = await this.model.findOne(params);
        return foundElem != null ?
            useEntity ? // @ts-ignore
                new this.entity().hydrate(foundElem) : // @ts-ignore
                this.getDataValuesRec(foundElem) :
            null;
    }

    static getDataValuesRec(data) {
        return data.dataValues ?
            Object.keys(data.dataValues).reduce((acc,key) => ({
                ...acc,
                [key]: data.dataValues[key] instanceof Array ?
                    data.dataValues[key].map(elem => this.getDataValuesRec(elem)) :
                    data.dataValues[key].datavalues ?
                        this.getDataValuesRec(data.dataValues[key].datavalues) :
                        data.dataValues[key]
            }), {}) :
            data;
    }
}
