import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Core/DB";
import User from "./User";
import Produit from "./Produit";
import env from "../Core/env.js";
const {DB_PREFIX} = env;

export interface IExemplaire {
    unit: number;
}

export default class Exemplaire extends Model {
    public id!: number;
    public number!: number;
}

Exemplaire.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        units: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
    },
    {
        tableName: DB_PREFIX+"exemplaire",
        sequelize, // passing the `sequelize` instance is required
    }
);

Exemplaire.belongsTo(User);
User.hasMany(Exemplaire);

Exemplaire.belongsTo(Produit);
Produit.hasMany(Exemplaire);
