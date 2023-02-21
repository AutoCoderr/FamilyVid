const fs = require('fs-extra');

let commandName
if (process.argv.length < 3) {
	commandName = "help";
} else {
	commandName = process.argv[2];
}

const path = __dirname+"/commands/";

(async () => {
	if (!await foundCommand(path)) {
		console.log("Wrong command");
		process.exit();
	}
})();

async function foundCommand(path) {
	const filesAndFolders  = await fs.readdir(path);
	for (const fileOrFolder  of filesAndFolders) {
		if (await fs.stat(path+fileOrFolder).then(elem => elem.isDirectory())) {
			if (await foundCommand(path+fileOrFolder+"/")) {
				return true;
			}
		} else {
			const Command = require(path+fileOrFolder);
			if (Command.commandName === commandName) {
				await Command.action();
				return true;
			}
		}
	}
	return false;
}

/*if(fs.existsSync(__dirname+"/commands/"+first)) {
	let action;

	if (second === "" && fs.existsSync(__dirname+"/commands/"+first+"/default.js")) {
		action = require(__dirname+"/commands/"+first+"/default.js");
	} else if (fs.existsSync(__dirname+"/commands/"+first+"/"+second+".js")) {
		action = require(__dirname+"/commands/"+first+"/"+second+".js");
	}
	if (action !== undefined) {
		action();
		return;
	}
}
console.log("Wrong command");
*/
