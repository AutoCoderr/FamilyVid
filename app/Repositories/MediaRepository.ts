import RepositoryManager from "../Core/RepositoryManager";
import SectionModel from "../Models/Section";
import CommentModel from "../Models/Comment";
import MediaModel from "../Models/Media";
import Media from "../Entities/Media";
import {col, fn, Op} from "sequelize";

export default class MediaRepository extends RepositoryManager {
    static model = MediaModel;
    static entity = Media;

    static findOne(id) {
        return super.findOne(id,SectionModel);
    }

    static findOneBySlug(slug) {
        return super.findOneByParams({
            where: { slug: slug },
            include: [SectionModel,CommentModel]
        })
    }

    static findAllBySectionIdAndSearchFilters(sectionsId: Array<number>|number,search,sort,sortBy,toDisplay){
        if (!(sectionsId instanceof Array)) {
            sectionsId = [sectionsId];
        }
        const searchDate = search.replace(/\//g,"-");
        search = "%"+search+"%";
        let date: Date = new Date(searchDate);
        let endDate;
        if (!isNaN(date.getTime())) {
            endDate = new Date(date.getTime());
            endDate.setHours(23);
            endDate.setMinutes(59);
            endDate.setSeconds(59);
            switch (count(searchDate,"-")) {
                case 0:
                    endDate.setMonth(11);
                    endDate.setDate(31);
                    break;
                case 1:
                    endDate.setDate(getNbDayByMonthAndYear(endDate.getMonth()+1,endDate.getFullYear()));
            }
        }
        return super.findAllByParams({
            where: {
                [Op.or]: [
                    {
                        name: {[Op.iLike]: search}
                    },
                        (!isNaN(date.getTime()) &&
                            {
                                date: {[Op.between]: [date,endDate]}
                            }
                        )
                ],
                SectionId: {[Op.in]: sectionsId},
                ...(toDisplay != "all" ? {type: toDisplay} : {})
            },
            order: [
                [
                    sortBy == "name" ? fn('lower', col("Media."+sortBy)) : sortBy,
                    sort
                ]
            ],
            include: SectionModel
        })
    }
}

function getNbDayByMonthAndYear(month,year) {
    let nbDay;
    if ([1,3,5,7,8,10,12].includes(month)) {
        nbDay = 31;
    } else if ([4,6,9,11].includes(month)) {
        nbDay = 30;
    } else if (month == 2) {
        nbDay = year % 4 == 0 ? 29 : 28
    }
    return nbDay;
}

function count(str,occu) {
    return (str.length-replaceAll(str,occu,"").length)/occu.length;
}

function replaceAll(str,A,B) {
    while(str.replace(A,B) != str) {
        str = str.replace(A,B);
    }
    return str;
}
