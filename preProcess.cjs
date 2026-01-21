const processUtil = require("./processUtil.cjs")

console.log("Cleaning working tree...");

processUtil.clearDirectory("./dist")
processUtil.clearDirectory(processUtil.ProjAssets)
processUtil.clearDirectory(processUtil.DistAssets)
processUtil.clearDirectory(processUtil.DeployAssets)

console.log("Successfully cleaned working tree!");