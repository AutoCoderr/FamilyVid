import fs from 'fs-extra';
import Command from "../Core/Command";

let commandName;
if (process.argv.length < 3) {
	commandName = "help";
} else {
	commandName = process.argv[2];
}

const path = __dirname+"/commands/";
let foundCommand: typeof Command|null = null;

(async () => {
	if (!await findCommand(path)) {
		console.log("Wrong command");
	} else if (foundCommand != null) {
		await (<typeof Command>foundCommand).action((<typeof Command>foundCommand).parse(process.argv));
	}
	process.exit();
})();

async function findCommand(path, p = 0) {
	const filesAndFolders  = await fs.readdir(path);
	for (const fileOrFolder  of filesAndFolders) {
		if (await fs.stat(path+fileOrFolder).then(elem => elem.isDirectory())) {
			if (!await findCommand(path+fileOrFolder+"/", p+1)) {
				return false;
			}
		} else if (fileOrFolder.endsWith(".js")) {
			const ACommand: typeof Command = require(path+fileOrFolder).default;
			if (ACommand.match(commandName)) {
				if (foundCommand == null) {
					foundCommand = ACommand;
				} else {
					console.log("Ambigous command name");
					return false;
				}
			}
		}
	}
	if (p == 0) {
		return foundCommand != null;
	} else {
		return true;
	}
}
