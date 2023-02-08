import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Core/DB";

import env from "../Core/env.js";
import User from "./User";
import User_Families from "./User_Families";
const {DB_PREFIX} = env;

export interface IFamily {
    name: string;
    slug: string;
}

export default class Family extends Model {
    public id!: number;
    public name!: string;
    public slug!: string;
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
        },
        slug: {
            type: DataTypes.STRING(60),
            allowNull: false
        }
    },
    {
        tableName: DB_PREFIX+"family",
        sequelize, // passing the `sequelize` instance is required
    }
);

Family.belongsToMany(User, { through: User_Families });
User.belongsToMany(Family, { through: User_Families });
