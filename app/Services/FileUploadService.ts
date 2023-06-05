import env from "../Core/env.js";
import * as fs from "fs-extra";
import * as path from "path";
import * as Jimp from 'jimp';

import Media from "../Entities/Media";
import Section from "../Entities/Section";
import Family from "../Entities/Family";
import User from "../Entities/User";

export default class FileUploadService {
    static mediaTypeByMimeType = {
        video: ['video/mp4','video/ogg','video/webm'],
        picture: ['image/png','image/jpeg','image/bmp']
    }

    static filesPath = path.resolve(__dirname+"/../"+env.UPLOAD_DIR);

    static async rotateMedia(family: Family, section: Section, media: Media, type: 'clockwise'|'anti-clockwise') {
        const filePath = this.filesPath+"/"+family.getSlug()+"/"+section.getSlug()+"/"+media.getSlug()+"."+media.getFileExtension();
        const image = await Jimp.read(filePath);
        image.rotate(type == "clockwise" ? -90 : 90).write(filePath);
    }

    static async deleteSection(family: Family, section: Section) {
        const familyPath = this.filesPath+"/"+family.getSlug();
        const sectionPath = familyPath+"/"+section.getSlug();

        if (await fs.exists(sectionPath)) {
            await fs.emptyDir(sectionPath);
            await fs.rmdir(sectionPath)
        }

        if (await fs.exists(familyPath) && (await fs.readdir(familyPath)).length == 0) {
            await fs.rmdir(familyPath);
        }

        await section.delete();
    }

    static async deleteMedia(family: Family, section: Section, media: Media) {
        const familyPath = this.filesPath+"/"+family.getSlug();
        const sectionPath = familyPath+"/"+section.getSlug();
        const mediaPath = sectionPath+"/"+media.getSlug()+"."+media.getFileExtension();

        if (await fs.exists(mediaPath)) {
            await fs.unlink(mediaPath);
        }

        if ((await fs.readdir(sectionPath)).length == 0) {
            await fs.rmdir(sectionPath);
        }
        if ((await fs.readdir(familyPath)).length == 0) {
            await fs.rmdir(familyPath);
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

        if (!await fs.exists(mediaPath)) {
            console.log("'"+mediaPath+"' not found, can't move media");
            return false;
        }
        if (!await fs.exists(newSectionPath)) {
            await fs.mkdir(newSectionPath);
        }

        media.setSection(newSection);
        await media.save();

        await fs.move(
            mediaPath,
            newMediaPath
        )
        if ((await fs.readdir(sectionPath)).length == 0) {
            await fs.rmdir(sectionPath);
        }
        return true;
    }

    static async renameSection(family: Family, section: Section, oldSlug: string) {
        const familyPath = this.filesPath+"/"+family.getSlug();
        const sectionPath = familyPath+"/"+oldSlug;

        const newSectionPath = familyPath+"/"+section.getSlug();

        if (await fs.exists(sectionPath)) {
            await fs.rename(sectionPath,newSectionPath);
        }
    }

    static async renameMedia(family: Family, section: Section, media: Media, oldSlug) {
        const familyPath = this.filesPath+"/"+family.getSlug();
        const sectionPath = familyPath+"/"+section.getSlug();
        const mediaPath = sectionPath+"/"+oldSlug+"."+media.getFileExtension();

        if (!await fs.exists(mediaPath)) {
            console.log("'"+mediaPath+"' not found, can't rename media");
            return false;
        }

        const newMediaPath = sectionPath+"/"+media.getSlug()+"."+media.getFileExtension();

        await fs.rename(mediaPath, newMediaPath);
        return true;
    }

    static uploadMedia(datas, media: Media) {
        return new Promise(async resolve => {
            const section: Section = datas.section;
            const familyPath = this.filesPath+"/"+(<Family>section.getFamily()).getSlug();
            const sectionPath = familyPath+"/"+section.getSlug();
            const mediaPath = sectionPath+"/"+media.getSlug()+"."+media.getFileExtension();

            if (!await fs.exists(familyPath)) {
                await fs.mkdir(familyPath);
            }
            if (!await fs.exists(sectionPath)) {
                await fs.mkdir(sectionPath);
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

    static async readMedia(family: Family, section: Section, media: Media, res) {
        const mediaPath = this.filesPath+"/"+family.getSlug()+"/"+section.getSlug()+"/"+media.getSlug()+"."+media.getFileExtension();
        if (!await fs.exists(mediaPath)) {
            res.send("Fichier introuvable");
            return;
        }
        res.sendFile(mediaPath);
    }
}
