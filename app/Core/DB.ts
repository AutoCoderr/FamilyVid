import { Sequelize } from "sequelize";
import env from "./env.js";
const {DB_DRIVER, DB_PORT, DB_HOST, DB_NAME, DB_USER, DB_PASSWORD} = env;

export const sequelize = new Sequelize(DB_DRIVER+"://"+DB_USER+":"+DB_PASSWORD+"@"+DB_HOST+":"+DB_PORT+"/"+DB_NAME, {
    logging: false
});

