import FamilyFixture from "./FamilyFixture";
import Family from "../Entities/Family";
import FamilyRepository from "../Repositories/FamilyRepository";
import Section from "../Entities/Section";

export default class SectionFixture {
    static execBefore = FamilyFixture;

    static action = async () => {
        const families: Array<Family> = await FamilyRepository.findAll();
        const sectionsPerFamily = ["Truc machin","Bidule chouette","Saperlipopette"];
        for (const family of families) {
            for (const sectionName of sectionsPerFamily) {
                let section = new Section();
                section.setName(sectionName);
                section.setFamily(family);

                await section.save();
            }
        }
    }
}