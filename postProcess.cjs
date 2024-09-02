const fs = require("fs")
const ProjRoot = "C:\\Users\\wangle\\Documents\\PythonCrawler\\";
const ProjAssets = ProjRoot + "assets\\"
const DistAssets = ProjRoot + "dist\\web\\assets\\"

fs.cpSync('./dist/index.html', ProjAssets + "index.html")
fs.cpSync('./dist/assets', ProjAssets, {recursive: true}, (err) => {
    if (err) {
        console.error(err);
    }
});

fs.cpSync(ProjAssets, DistAssets, {recursive: true}, (err) => {
    if (err) {
        console.error(err);
    }
});