import Command from "../../../Core/Command";
import fs from "fs-extra";
import path from "path";
import CreateUserService from "../../../Services/CreateUserService";

export default class UserCreateMulti extends Command {
    static commandName = "user:create:multi";

    static argsModel = {
        $argsWithoutKey: [
            {
                field: "file",
                type: "string",
                description: "Le fichier csv des utilisateurs"
            }
        ]
    };

    static async action(args: {file: string}) {
        let {file} = args;
        const rootPath = path.resolve(__dirname+"/../../..");

        if (!await fs.exists(file)) {
            file = rootPath+"/"+file;
        }

        if (!await fs.exists(file)) {
            console.log("'"+file+"' doest not exist");
            return;
        }

        const fileStat = await fs.stat(file);
        if (await fileStat.isDirectory()) {
            console.log("'"+file+"' est un répertoire");
            return;
        }
        if (fileStat.size > 500*1024*1024) {
            console.log("Le fichier fait plus de 500 mo");
            return;
        }

        const content = await fs.readFile(file).then(buffer => buffer.toString());

        if (content.split("\r\n")[0] != "email;firstname;lastname;password;families;requestPassword") {
            console.log("Vous devez renseigner un fichier csv contenant les champs suivants :");
            console.log("\temail;firstname;lastname;password;families;requestPassword");
            return;
        }
        const lines = content.split("\r\n").slice(1);

        let nbUser = 0;
        for (const line of lines) {
            const columns = line.split(";");
            if (columns.length != 6) continue;
            const [email,firstname,lastname,password,families,requestPassword] = columns;
            console.log("\n"+email);
            if (!await CreateUserService.createUser(
                email,
                firstname,
                lastname,
                password,
                families != "" ? families : null,
                requestPassword != "" ? requestPassword : null
            )) {
                return;
            }
            nbUser += 1;
        }
        console.log("\n"+nbUser+" utilisateurs créés");
    }

    static help() {
        console.log("Exemple : node bin/console.js "+this.commandName+" fichierCsvDesUtitisateurs");
    }
}
