const fs = require('fs-extra');

const first = process.argv[2].split(':')[0],
	second = typeof(process.argv[2].split(':')[1]) != "undefined" ? process.argv[2].split(':')[1] : "";

if(fs.existsSync(__dirname+"/commands/"+first)) {
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
