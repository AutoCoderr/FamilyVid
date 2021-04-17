import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Core/DB";

import env from "../Core/env.js";
import Section from "./Section";
const {DB_PREFIX} = env;

export interface IMedia {
    name: string;
    slug: string;
    date: string;
    type: string
}

export default class Media extends Model {
    public id!: number;
    public name!: string;
    public slug!: string;
    public date!: string;
    public type!: string;
}

Media.init(
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
        },
        fileExtension: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING(7),
            allowNull: false
        }
    },
    {
        tableName: DB_PREFIX+"media",
        sequelize, // passing the `sequelize` instance is required
    }
);

Media.belongsTo(Section, {onDelete: 'CASCADE'});
Section.hasMany(Media, {as: 'Medias', onDelete: 'CASCADE'});
