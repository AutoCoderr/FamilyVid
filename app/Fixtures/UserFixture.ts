import FamilyFixture from "./FamilyFixture";
import User from "../Entities/User";
import FamilyRepository from "../Repositories/FamilyRepository";
import Family from "../Entities/Family";
import Helpers from "../Core/Helpers";

export default class UserFixture {
    static execBefore = FamilyFixture;

    static action = async () => {
        const families: Array<Family> = await FamilyRepository.findAll();

        const user = new User();
        user.setFirstname("Julien");
        user.setLastname("BOUVET");
        user.setEmail("julienbouvet78@hotmail.com");
        user.addRole("USER");
        user.setPassword("1234");

        await user.save();

        for (const family of families) {
            if (family.getName() == "BOUVET") {
                await user.addFamily(family);
                break;
            }
        }

        for (let i=1;i<=20;i++) {
            const user = new User();
            user.setFirstname("test"+i);
            user.setLastname("test"+i);
            user.setEmail("test"+i+"@test.com");
            user.addRole("USER");
            user.setPassword("1234");
            await user.save();

            const nbFamilies = Helpers.rand(1,2);
            for (let j=0;j<nbFamilies;j++) {
                const family = families[Helpers.rand(0,families.length-1)];
                await user.addFamily(family);
            }
        }
    }
}