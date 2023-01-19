/*import User from "../Models/User";
import Produit from "../Models/Produit";
import Exemplaire from "../Models/Exemplaire";*/
import * as fs from "fs-extra";

export default class Migration {
    static tables: Array<any> = [];

    static async migrate() {
        if (this.tables.length == 0) {
            const migrationsOrder = JSON.parse(fs.readFileSync(__dirname+"/migrationsOrder.json"));
            for (const modelName of migrationsOrder) {
                const model = require(__dirname+"/../Models/"+modelName+".js").default;
                this.tables.push(model)
            }
        }

        let nbRetry = 0;
        const maxRetry = 30;
        let syncSuccessful = false;

        while (nbRetry < maxRetry && !syncSuccessful) {
            let nbSyncedTables = 0;
            for (let table of this.tables) {
                try {
                    await table.sync();
                    nbSyncedTables += 1;
                } catch (e) {
                    console.log("Connection to database failed, retry")
                    await wait(500);
                    break;
                }
            }
            if (nbSyncedTables == this.tables.length) syncSuccessful = true;
            nbRetry += 1;
        }
        console.log(syncSuccessful ? "Database synchronized!" : "All database connections retry failed");
    }
}

function wait(ms: number) {
    return new Promise(resolve => {
       setTimeout(resolve,ms);
    });
}
