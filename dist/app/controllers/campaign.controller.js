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
exports.zz = exports.createCampaign = void 0;
const campaign_model_1 = require("../db/models/campaign.model");
const error_utils_1 = require("../utils/error.utils");
const file_controller_1 = require("./file.controller");
const createCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const insert = yield (0, campaign_model_1.insertCampaign)({
        client: req.body.client,
        name: req.body.name,
        subject: req.body.subject,
        idTemplate: req.body.idTemplate,
        schedule: req.body.schedule
    });
    const path = './' + req.file.path.replace('\\', '/');
    let dataExcel = yield (0, file_controller_1.getDataXlsx)(path);
    dataExcel = dataExcel.map((row) => {
        return {
            idCampaign: insert.id,
            email: row.EMAIL.toString(),
            indentity: row.IDENTIFICACION.toString(),
            fullName: row.NOMBRE.toString(),
            customVariables: JSON.stringify(row)
        };
    });
    yield (0, campaign_model_1.insertDataEmail)(dataExcel);
    (0, error_utils_1.log)('info', {
        msg: insert
    });
    (0, error_utils_1.log)('info', {
        msg: 'Se ha creado correctamente la campaña ' + req.body.name
    });
    return res.status(201).json({
        message: 'Todo OK',
        status: true,
        data: insert
    });
});
exports.createCampaign = createCampaign;
const zz = (req, res) => {
    console.log(req, res);
};
exports.zz = zz;
//# sourceMappingURL=campaign.controller.js.map