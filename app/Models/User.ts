import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Core/DB";
import env from "../Core/env.js";
const {DB_PREFIX} = env;

export interface IUser {
    email: string;
    firstname: string;
    lastname: string;
    roles: string;
    password: string;
}

export default class User extends Model {
    public id!: number;
    public firstname!: string;
    public lastname!: string;
    public roles!: string;
    public password!: string;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        firstname: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        lastname: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        roles: {
            type: DataTypes.STRING(50),
            defaultValue: "[\"USER\"]"
        },
        password: {
            type: DataTypes.STRING(40),
            allowNull: false
        },
    },
    {
        tableName: DB_PREFIX+"user",
        sequelize, // passing the `sequelize` instance is required
    }
);
