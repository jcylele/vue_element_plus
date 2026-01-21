const fs = require("fs")
const path = require('path');

const ProjRoot = "D:\\Projects\\Python Projects\\PythonCrawler\\";
const ProjAssets = ProjRoot + "assets\\";
const DistAssets = ProjRoot + "dist\\web\\_internal\\assets\\";
const DeployAssets = "D:\\OnlyFans\\__app\\_internal\\assets\\";

function clearDirectory(path) {
	// delete
	try {
		fs.rmSync(path, { recursive: true });
	} catch (e) {
		console.log(e)
	}

	// create
	fs.mkdirSync(path);
}

function copyFiles(src, dst, file = null) {
	if (file != null) {
		src = path.join(src, file)
		dst = path.join(dst, file)
	}
	fs.cpSync(src, dst, { recursive: true }, (err) => {
		if (err) {
			console.error(err);
		}
	});
}

exports.copyFiles = copyFiles
exports.clearDirectory = clearDirectory
exports.DistAssets = DistAssets
exports.ProjAssets = ProjAssets
exports.ProjRoot = ProjRoot
exports.DeployAssets = DeployAssets
