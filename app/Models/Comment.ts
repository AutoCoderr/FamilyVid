import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Core/DB";

import env from "../Core/env.js";
import Media from "./Media";
import User from "./User";
const {DB_PREFIX} = env;

export interface IComment {
    content: string;
}

export default class Comment extends Model {
    public id!: number;
    public content!: string;
}

Comment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        updated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        tableName: DB_PREFIX+"comment",
        sequelize, // passing the `sequelize` instance is required
    }
);

Comment.belongsTo(Media, {as: "Media", foreignKey: "MediaId", onDelete: 'CASCADE'});
Media.hasMany(Comment, {foreignKey: "MediaId", onDelete: 'CASCADE'});

Comment.belongsTo(User);
User.hasMany(Comment);