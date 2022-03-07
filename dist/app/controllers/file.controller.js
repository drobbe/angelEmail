'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	return new (P || (P = Promise))(function (resolve, reject) {
		function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
		function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
		function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.base64Encode = exports.buildImagesTemplate = exports.getDataXlsx = exports.previewFile = void 0;
const error_utils_1 = require("../utils/error.utils");
const main_utils_1 = require("../utils/main.utils");
const node_html_to_image_1 = require("node-html-to-image");
const fs = require('fs');
const previewFile = function (req, res) {
	return __awaiter(this, void 0, void 0, function* () {
		let path = './' + req.file.path.replace('\\', '/');
		let xlData = yield (0, main_utils_1.loadExcelFile)(path);
		const row = xlData[0];
		fs.unlink(path, (err) => {
			if (err) {
				(0, error_utils_1.log)('error', {
					message: 'Error Eliminando Archivo excel',
					err: err
				}, 'error');
				console.error(err);
			}
		});
		let array = Object.entries(row).map(([k]) => k);
		const requiresColumns = ['NOMBRE', 'IDENTIFICACION', 'EMAIL'];
		const containsAll = requiresColumns.every((i) => array.includes(i));
		if (containsAll) {
			(0, error_utils_1.log)('info', {
				message: 'Archivo Excel Preview Eliminado',
				file: req.file
			});
			res.status(200).json({
				message: 'Cabezeras Leidas',
				data: array
			});
		}
		else {
			res.status(406).json({
				message: 'Es necesario que el archivo excel contenga al menos la siguientes columnas: ' +
					requiresColumns.join(', '),
				status: false,
				error: { error: 'Columnas requeridas no válidas' }
			});
		}
	});
};
exports.previewFile = previewFile;
const getDataXlsx = (path) => __awaiter(void 0, void 0, void 0, function* () {
	let xlData = yield (0, main_utils_1.loadExcelFile)(path);
	return xlData;
});
exports.getDataXlsx = getDataXlsx;
const buildImagesTemplate = (templateName, html) => {
	const output = `./src/app/public/assets/images/${templateName}.png`;
	return (0, node_html_to_image_1.default)({
		output: output,
		html: html,
		puppeteerArgs: {
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		}
	})
		.then(() => output)
		.catch((error) => {
			console.error(error);
			return false;
		});
};
exports.buildImagesTemplate = buildImagesTemplate;
const base64Encode = (file) => {
	const bitmap = fs.readFileSync(file);
	return Buffer.from(bitmap).toString('base64');
};
exports.base64Encode = base64Encode;
//# sourceMappingURL=file.controller.js.map