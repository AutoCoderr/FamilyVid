import Family from "../Entities/Family";

export default class FamilyFixture {
    static action = async () => {
        const familyNames = ["BOUVET","MOATTY","ALOIS","GAMBOSO","DE GAULLE","De Molay"];
        for (const name of familyNames) {
            const family = new Family();
            family.setName(name);
            await family.setSlugFrom("name");
            await family.save()
        }
    }
}
