const fs = require("fs")

function clearDirectory(path) {
    // delete
    fs.rmSync(path, {recursive: true});
// create
    fs.mkdirSync(path);
}

console.log("Cleaning working tree...");

const target_folder = process.argv[2];
clearDirectory("./dist")
clearDirectory(target_folder)

console.log("Successfully cleaned working tree!");