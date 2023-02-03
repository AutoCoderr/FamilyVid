import env from "../Core/env.js";
import * as fs from "fs-extra";
import Media from "../Entities/Media";
import Section from "../Entities/Section";
import Family from "../Entities/Family";

export default class UploadService {
    static mediaTypeByMimeType = {
        video: ['video/mp4','video/ogg','video/x-msvideo'],
        picture: ['image/png','image/jpeg','image/bmp']
    }

    static uploadMedia(datas,section: Section) {
        return new Promise(async resolve => {
            const splitFilename = datas.file.name.split(".");
            const filename = splitFilename.slice(0,splitFilename.length-1).join(".");
            const ext = splitFilename.slice(-1);

            let media = new Media();
            media.setDate(datas.date);
            media.setName(datas.name != "" ? datas.name : filename);
            await media.setSlugFrom("name");

            for (const mediaType in this.mediaTypeByMimeType) {
                if (this.mediaTypeByMimeType[mediaType].includes(datas.file.mimetype)) {
                    media.setType(mediaType);
                    break;
                }
            }
            media.setSection(section);
            await media.save();

            const mediaDir = __dirname+"/../"+env.UPLOAD_DIR;
            if (!fs.existsSync(mediaDir+"/"+(<Family>section.getFamily()).getSlug())) {
                fs.mkdirSync(mediaDir+"/"+(<Family>section.getFamily()).getSlug());
            }
            if (!fs.existsSync(mediaDir+"/"+(<Family>section.getFamily()).getSlug()+"/"+section.getSlug())) {
                fs.mkdirSync(mediaDir+"/"+(<Family>section.getFamily()).getSlug()+"/"+section.getSlug());
            }
            datas.file.mv(mediaDir+"/"+(<Family>section.getFamily()).getSlug()+"/"+section.getSlug()+"/"+media.getSlug()+"."+ext, (err) => {
                if (err) {
                    resolve(false);
                    throw err;
                }
                resolve(true);
            });
        });
    }
}
