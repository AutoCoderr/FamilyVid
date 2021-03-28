import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Core/DB";

import env from "../Core/env.js";
const {DB_PREFIX} = env;

export interface IUser_Families {
    visible: boolean;
}

export default class User_Families extends Model {
    public visible!: boolean;
}

User_Families.init(
    {
        visible: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        tableName: DB_PREFIX+"User_Families",
        timestamps: false,
        sequelize, // passing the `sequelize` instance is required
    }
);

