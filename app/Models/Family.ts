import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Core/DB";

import env from "../Core/env.js";
import User from "./User";
const {DB_PREFIX} = env;

export interface IFamily {
    name: string;
}

export default class Family extends Model {
    public id!: number;
    public name!: string;
}

Family.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    },
    {
        tableName: DB_PREFIX+"family",
        sequelize, // passing the `sequelize` instance is required
    }
);

Family.belongsToMany(User, { through: DB_PREFIX+"User_Families" });
User.belongsToMany(Family, { through: DB_PREFIX+"User_Families" });