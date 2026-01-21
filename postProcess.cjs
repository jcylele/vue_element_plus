const processUtil = require("./processUtil.cjs")

console.log("Coping assets!");

processUtil.copyFiles("./dist", processUtil.ProjAssets, "index.html")
processUtil.copyFiles('./dist/assets', processUtil.ProjAssets)
processUtil.copyFiles(processUtil.ProjAssets, processUtil.DistAssets)
processUtil.copyFiles(processUtil.ProjAssets, processUtil.DeployAssets)

console.log("Successfully copied assets!");