import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Core/DB";

import env from "../Core/env.js";
import User from "./User";
import Family from "./Family";
const {DB_PREFIX} = env;

export interface IConfirmation {
    token: string;
}

export default class Confirmation extends Model {
    public id!: number;
    public token!: string;
}

Confirmation.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        token: {
            type: DataTypes.STRING(20),
            defaultValue: false
        },
        type: {
            type: DataTypes.STRING(8) // account or password
        }
    },
    {
        tableName: DB_PREFIX+"confirmation",
        sequelize, // passing the `sequelize` instance is required
    }
);

Confirmation.belongsTo(User, {onDelete: 'CASCADE'});
User.hasOne(Confirmation, {onDelete: 'CASCADE'});
