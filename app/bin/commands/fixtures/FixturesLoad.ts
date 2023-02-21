import fs from 'fs-extra';
import Command from "../../../Core/Command";


export default class FixtureLoad extends Command {
    static commandName = "fixtures:load";

    static async action(_) {
        const path = __dirname+"/../../../Fixtures";
        const files = fs.readdirSync(path).filter(file => file.endsWith(".js"));

        let fixtureLoadeds = {};
        for (const file of files) {
            const fixture = require(path+"/"+file).default;
            if (!fixtureLoadeds[fixture.name]) {
                if (fixture.execBefore !== undefined) {
                    if (!(fixture.execBefore instanceof Array)) {
                        fixture.execBefore = [fixture.execBefore];
                    }
                    for (const fixtureToload of fixture.execBefore) {
                        if (!fixtureLoadeds[fixtureToload.name]) {
                            console.log("\nExec "+fixtureToload.name);
                            await fixtureToload.action();
                            console.log(fixtureToload.name+" executed");
                            fixtureLoadeds[fixtureToload.name] = true;
                        }
                    }
                }
                console.log("\nExec "+fixture.name);
                await fixture.action()
                console.log(fixture.name+" executed")
                fixtureLoadeds[fixture.name] = true;
            }
        }
        console.log("\n\nAll fixtures executed");
        process.exit();
    }
}
