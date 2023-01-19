import { sequelize } from "./DB";
import * as fs from "fs-extra";

export default class Migration {
    static tables: Array<any> = [];

    static async migrate() {
        if (this.tables.length == 0) {
            const files = fs.readdirSync(__dirname+"/../Models").filter(file => file.endsWith(".js"));
            for (const file of files) {
                const model = require(__dirname+"/../Models/"+file).default;
                this.tables.push(model)
            }
        }

        let nbRetry = 0;
        const maxRetry = 30;
        let syncSuccessful = false;

        while (nbRetry < maxRetry && !syncSuccessful) {
            try {
                await sequelize.sync({alter: true});
                syncSuccessful = true;
            }  catch (e) {
                console.log("Database synchronization failed, retry");
                await sleep(500);
                nbRetry += 1;
            }
        }
        console.log(syncSuccessful ? "Database synchronized!" : "All database connections retry failed");
    }
}

function sleep(ms: number) {
    return new Promise(resolve => {
       setTimeout(resolve,ms);
    });
}
