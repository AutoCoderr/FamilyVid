import env from "../Core/env.js";
import * as fs from "fs-extra";
import * as path from "path";

import Media from "../Entities/Media";
import Section from "../Entities/Section";
import Family from "../Entities/Family";

export default class FileUploadService {
    static mediaTypeByMimeType = {
        video: ['video/mp4','video/ogg','video/webm'],
        picture: ['image/png','image/jpeg','image/bmp']
    }

    static filesPath = path.resolve(__dirname+"/../"+env.UPLOAD_DIR);

    static async deleteSection(family: Family, section: Section) {
        const familyPath = this.filesPath+"/"+family.getSlug();
        const sectionPath = familyPath+"/"+section.getSlug();

        if (fs.existsSync(sectionPath)) {
            fs.emptyDirSync(sectionPath);
            fs.rmdirSync(sectionPath)
        }

        if (fs.existsSync(familyPath) && fs.readdirSync(familyPath).length == 0) {
            fs.rmdirSync(familyPath);
        }

        await section.delete();
    }

    static async deleteMedia(family: Family, section: Section, media: Media) {
        const familyPath = this.filesPath+"/"+family.getSlug();
        const sectionPath = familyPath+"/"+section.getSlug();
        const mediaPath = sectionPath+"/"+media.getSlug()+"."+media.getFileExtension();

        if (fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath);
        }

        if (fs.readdirSync(sectionPath).length == 0) {
            fs.rmdirSync(sectionPath);
        }
        if (fs.readdirSync(familyPath).length == 0) {
            fs.rmdirSync(familyPath);
        }
        await media.delete();
    }

    static async moveAllMedia(section: Section, newSection: Section) {
        for (const media of <Array<Media>>section.getMedias()) {
            if (!await this.moveMedia(<Family>section.getFamily(),section,newSection, media)) {
                return false;
            }
        }
        return true;
    }

    static async moveMedia(family: Family, section: Section, newSection: Section, media: Media) {
        const familyPath = this.filesPath+"/"+family.getSlug();
        const sectionPath = familyPath+"/"+section.getSlug();
        const newSectionPath = familyPath+"/"+newSection.getSlug();

        const mediaPath = sectionPath+"/"+media.getSlug()+"."+media.getFileExtension();
        const newMediaPath = newSectionPath+"/"+media.getSlug()+"."+media.getFileExtension();

        if (!fs.existsSync(mediaPath)) {
            console.log("'"+mediaPath+"' not found, can't move media");
            return false;
        }
        if (!fs.existsSync(newSectionPath)) {
            fs.mkdirSync(newSectionPath);
        }

        media.setSection(newSection);
        await media.save();

        await fs.move(
            mediaPath,
            newMediaPath
        )
        if (fs.readdirSync(sectionPath).length == 0) {
            fs.rmdirSync(sectionPath);
        }
        return true;
    }

    static async renameSection(family: Family, section: Section, newName: string) {
        const familyPath = this.filesPath+"/"+family.getSlug();
        const sectionPath = familyPath+"/"+section.getSlug();

        section.setName(newName);
        await section.setSlugFrom("name");
        await section.save();

        const newSectionPath = familyPath+"/"+section.getSlug();

        if (fs.existsSync(sectionPath)) {
            fs.renameSync(sectionPath,newSectionPath);
        }
    }

    static async renameMedia(family: Family, section: Section, media: Media, newName: string) {
        const familyPath = this.filesPath+"/"+family.getSlug();
        const sectionPath = familyPath+"/"+section.getSlug();
        const mediaPath = sectionPath+"/"+media.getSlug()+"."+media.getFileExtension();

        if (!fs.existsSync(mediaPath)) {
            console.log("'"+mediaPath+"' not found, can't rename media");
            return false;
        }

        media.setName(newName);
        await media.setSlugFrom("name");

        const newMediaPath = sectionPath+"/"+media.getSlug()+"."+media.getFileExtension();

        fs.renameSync(mediaPath, newMediaPath);
        return true;
    }

    static uploadMedia(datas,section: Section) {
        return new Promise(async resolve => {
            const splitFilename = datas.file.name.split(".");
            const filename = splitFilename.slice(0,splitFilename.length-1).join(".");
            const ext = splitFilename.slice(-1)[0];

            let media = new Media();
            media.setDate(datas.date);
            media.setName(datas.name != "" ? datas.name : filename);
            await media.setSlugFrom("name");
            media.setFileExtension(ext);
            if (datas.tags) {
                media.setTags(datas.tags);
            }

            for (const mediaType in this.mediaTypeByMimeType) {
                if (this.mediaTypeByMimeType[mediaType].includes(datas.file.mimetype)) {
                    media.setType(mediaType);
                    break;
                }
            }
            media.setSection(section);
            await media.save();

            const familyPath = this.filesPath+"/"+(<Family>section.getFamily()).getSlug();
            const sectionPath = familyPath+"/"+section.getSlug();
            const mediaPath = sectionPath+"/"+media.getSlug()+"."+media.getFileExtension();

            if (!fs.existsSync(familyPath)) {
                fs.mkdirSync(familyPath);
            }
            if (!fs.existsSync(sectionPath)) {
                fs.mkdirSync(sectionPath);
            }
            datas.file.mv(mediaPath, (err) => {
                if (err) {
                    resolve(false);
                    throw err;
                }
                resolve(true);
            });
        });
    }

    static readMedia(family: Family, section: Section, media: Media, res) {
        const mediaPath = this.filesPath+"/"+family.getSlug()+"/"+section.getSlug()+"/"+media.getSlug()+"."+media.getFileExtension();
        if (!fs.existsSync(mediaPath)) {
            res.send("Fichier introuvable");
            return;
        }
        res.sendFile(mediaPath);
    }
}
