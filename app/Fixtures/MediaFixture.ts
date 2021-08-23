import Family from "../Entities/Family";
import FamilyRepository from "../Repositories/FamilyRepository";
import Section from "../Entities/Section";
import SectionFixture from "./SectionFixture";
import Helpers from "../Core/Helpers";
import Media from "../Entities/Media";

export default class MediaFixture {
    static execBefore = SectionFixture;

    static action = async () => {
        /*const families: Array<Family> = await FamilyRepository.findAll();
        const dates = ["1999-08-10","1997-12-17","2000-01-15","1998-06-18"];
        for (const family of families) {
            for (const section of <Array<Section>>family.getSections()) {
                const nbMedia = Helpers.rand(10,20);
                for (let i=0;i<nbMedia;i++) {
                    let media = new Media();
                    const date = dates[Helpers.rand(0,dates.length-1)];
                    if (Helpers.rand(1,3) == 1) {
                        await media.setName(date);
                    } else {
                        await media.setName(randomString());
                    }
                    media.setDate(date);
                    media.setType(Helpers.rand(0,1) == 1 ? "video": "picture");
                    media.setSection(section);
                    media.setFileExtension(media.getType() === "video" ? 'mp4' : 'jpg')
                    media.setNbViews(0);
                    await media.save();
                }
            }
        }*/
    }
}
