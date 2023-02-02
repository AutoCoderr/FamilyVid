import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Core/DB";

import env from "../Core/env.js";
import Family from "./Family";
const {DB_PREFIX} = env;

export interface ISection {
    name: string;
}

export default class Section extends Model {
    public id!: number;
    public name!: string;
}

Section.init(
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
        tableName: DB_PREFIX+"section",
        sequelize, // passing the `sequelize` instance is required
    }
);

Section.belongsTo(Family);
Family.hasMany(Section);
