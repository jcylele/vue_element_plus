const fs = require("fs")
const ProjRoot = "C:\\Users\\wangle\\Documents\\PythonCrawler\\";
const ProjAssets = ProjRoot + "assets"
const DistAssets = ProjRoot + "dist\\web\\assets"

function clearDirectory(path) {
    // delete
    fs.rmSync(path, {recursive: true});
// create
    fs.mkdirSync(path);
}

console.log("Cleaning working tree...");

clearDirectory("./dist")
clearDirectory(ProjAssets)
clearDirectory(DistAssets)

console.log("Successfully cleaned working tree!");