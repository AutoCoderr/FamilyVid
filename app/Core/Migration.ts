import { sequelize } from "./DB";
import * as fs from "fs-extra";

export default class Migration {
    static path = __dirname+"/../Models";

    static async migrate() {
        fs.readdirSync(this.path)
            .filter(file => file.endsWith(".js"))
            .map(file => require(this.path+"/"+file).default);

        let nbRetry = 0;
        const maxRetry = 30;
        let syncSuccessful = false;

        while (nbRetry < maxRetry && !syncSuccessful) {
            try {
                await sequelize.sync({alter: true});
                syncSuccessful = true;
            }  catch (e) {
                console.error(e);
                console.log("Database synchronization failed, retry");
                await sleep(500);
                nbRetry += 1;
            }
        }
        console.log(syncSuccessful ? "Database synchronized!" : "All database connections retry failed");
    }

    static drop() {
        return Promise.all(fs.readdirSync(this.path)
            .filter(file => file.endsWith(".js"))
            .map(file => require(this.path+"/"+file).default)
            .map(model => model.destroy({where:{}})));
    }
}

function sleep(ms: number) {
    return new Promise(resolve => {
       setTimeout(resolve,ms);
    });
}
