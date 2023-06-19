import Family from "../Entities/Family";
import Helpers from "../Core/Helpers";

export default class FamilyFixture {
    static action = async () => {
        const familyNames = {
            BOUVET: 1,
            MOATTY: 1,
            ALOIS: 1,
            GAMBOSO: 1,
            "DE GAULLE": 1,
            "De Molay": 1
        };

        for (let i=0;i<1000;i++) {
            let familyName = Object.keys(familyNames)[Helpers.rand(0,Object.keys(familyNames).length-1)];
            const family = new Family();
            await family.setName(familyName+(familyNames[familyName] > 1 ? " "+familyNames[familyName] : ""));
            await family.save()
            familyNames[familyName] += 1;
        }
    }
}
