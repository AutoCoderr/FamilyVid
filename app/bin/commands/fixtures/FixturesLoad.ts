import fs from 'fs-extra';
import Command from "../../../Core/Command";
import Migration from "../../../Core/Migration";


export default class FixtureLoad extends Command {
    static commandName = "fixtures:load";
    static description = "Executer les fixtures";

    static async action(_) {
        if (!await this.validQuestion("Attention, si vous chargez les fixtures, la base de donnée actuelle sera supprimé, voulez vous le faire? (Y/n) ? : ",["y","yes","o","oui"])) {
            return;
        }
        await Migration.drop();

        const path = __dirname+"/../../../Fixtures";
        const fixtures = fs.readdirSync(path)
            .filter(file => file.endsWith(".js"))
            .map(file => require(path+"/"+file).default);

        await this.execFixtures(fixtures);

        console.log("\n\nAll fixtures executed");
    }

    static async execFixtures(fixtures, fixtureLoadeds = {}) {
        for (const fixture of fixtures) {
            if (!fixtureLoadeds[fixture.name]) {
                if (fixture.execBefore !== undefined) {
                    if (!(fixture.execBefore instanceof Array)) {
                        fixture.execBefore = [fixture.execBefore];
                    }
                    await this.execFixtures(fixture.execBefore,fixtureLoadeds)
                }
                console.log("\nExec "+fixture.name);
                await fixture.action()
                console.log(fixture.name+" executed")
                fixtureLoadeds[fixture.name] = true;
            }
        }
    }
}
