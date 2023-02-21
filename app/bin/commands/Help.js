module.exports = class Help {
    static commandName = "help";

    static action() {
        console.log("You can run :");
        console.log("\t- migration");
        console.log("\t- make");
        console.log("\t- fixtures");
    }
}
