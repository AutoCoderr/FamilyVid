import { Model, DataTypes } from "sequelize";
import { sequelize } from "../Core/DB";

import env from "../Core/env.js";
import User from "./User";
import Family from "./Family";
const {DB_PREFIX} = env;

export interface IFamilyDemand {
    visible: boolean;
}

export default class FamilyDemand extends Model {
    public id!: number;
    public visible!: boolean;
}

FamilyDemand.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        visible: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        tableName: DB_PREFIX+"familydemand",
        sequelize, // passing the `sequelize` instance is required
    }
);

FamilyDemand.belongsTo(User, {foreignKey: "ApplicantId", as: "Applicant"});

FamilyDemand.belongsTo(User);
FamilyDemand.belongsTo(Family);
