import fs from 'fs-extra';
import Command from "../Core/Command";

let commandName = "";
if (process.argv.length >= 3) {
	commandName = process.argv[2];
}

const path = __dirname+"/commands/";
let foundCommand: typeof Command | null = null;

if (commandName != "") {
	(async () => {
		if (!await findCommand(path)) {
			console.log("Wrong command");
		} else if (foundCommand != null) {
			await (<typeof Command>foundCommand).start(process.argv);
		}
		process.exit();
	})();
} else {
	(async () => {
		let commands: Array<typeof Command> = await getAllCommands(path)
		commands = commands.sort((a,b) => {
			return a.commandName > b.commandName ? 1 : -1;
		});
		console.log("Toutes les commandes :\n");
		for (let i=0;i<commands.length;i++) {
			if (i > 0 && commands[i-1].commandName.split(":")[0] != commands[i].commandName.split(":")[0]) {
				console.log("");
			}
			console.log(commands[i].commandName+(commands[i].description != undefined ? " => "+commands[i].description : "  -"));
		}
	})();
}

async function getAllCommands(path, commands: Array<typeof Command> = [], p= 0) {
	const filesAndFolders = await fs.readdir(path);
	for (const fileOrFolder of filesAndFolders) {
		if (await fs.stat(path + fileOrFolder).then(stat => stat.isDirectory())) {
			await getAllCommands(path + fileOrFolder + "/",commands,p+1);
		} else if (fileOrFolder.endsWith(".js")) {
			const ACommand: typeof Command = require(path + fileOrFolder).default;
			commands.push(ACommand);
		}
	}
	return commands;
}

async function findCommand(path, p = 0) {
	const filesAndFolders = await fs.readdir(path);
	for (const fileOrFolder of filesAndFolders) {
		if (await fs.stat(path + fileOrFolder).then(elem => elem.isDirectory())) {
			if (!await findCommand(path + fileOrFolder + "/", p + 1)) {
				return false;
			}
		} else if (fileOrFolder.endsWith(".js")) {
			const ACommand: typeof Command = require(path + fileOrFolder).default;
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
