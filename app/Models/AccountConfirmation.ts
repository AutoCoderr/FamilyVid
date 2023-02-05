import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Core/DB";

import env from "../Core/env.js";
import User from "./User";
import Family from "./Family";
const {DB_PREFIX} = env;

export interface IAccountConfirmation {
    token: string;
}

export default class AccountConfirmation extends Model {
    public id!: number;
    public token!: string;
}

AccountConfirmation.init(
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
        }
    },
    {
        tableName: DB_PREFIX+"accountconfirmation",
        sequelize, // passing the `sequelize` instance is required
    }
);

AccountConfirmation.belongsTo(User, {onDelete: 'CASCADE'});
User.hasOne(AccountConfirmation, {onDelete: 'CASCADE'});
