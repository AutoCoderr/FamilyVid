import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Core/DB";
import env from "../Core/env.js";
const {DB_PREFIX} = env;

export interface IProduit {
    name: string;
    description: string;
    units: number;
}

export default class Produit extends Model {
    public id!: number;
    public name!: string;
    public description!: string;
    public units!: number;
}

Produit.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        units: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
    },
    {
        tableName: DB_PREFIX+"produit",
        sequelize, // passing the `sequelize` instance is required
    }
);
