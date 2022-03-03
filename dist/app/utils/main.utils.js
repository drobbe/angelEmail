"use strict";
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
exports.loadExcelFile = void 0;
const XLSX = require('xlsx');
const error_utils_1 = require("../utils/error.utils");
const loadExcelFile = (path) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let workbook = yield XLSX.readFile(path);
        let sheetNameList = workbook.SheetNames;
        let xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);
        return xlData;
    }
    catch (error) {
        (0, error_utils_1.log)('error', {
            message: 'Archivo Excel Preview Eliminado',
            error: error
        }, 'error');
        console.error(error);
        throw error('Error Leyendo Archivo');
    }
});
exports.loadExcelFile = loadExcelFile;
//# sourceMappingURL=main.utils.js.map