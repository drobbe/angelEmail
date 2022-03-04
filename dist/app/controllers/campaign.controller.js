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
exports.playCampaign = exports.listCampaign = exports.createCampaign = void 0;
const campaign_model_1 = require("../db/models/campaign.model");
const mailconfig_model_1 = require("../db/models/mailconfig.model");
const email_utils_1 = require("../utils/email.utils");
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
const listCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.headers.idclient);
    const idClient = Number(req.headers.idclient);
    const campaigns = yield (0, campaign_model_1.getCampaignsClient)(idClient);
    (0, error_utils_1.log)('info', {
        msg: 'Se ha creado correctamente la campaña ' + req.body.name
    });
    return res.status(201).json({
        message: 'Todo OK',
        status: true,
        data: campaigns
    });
});
exports.listCampaign = listCampaign;
const playCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Require: ', req.params);
    const objCampaign = yield (0, campaign_model_1.getCampaign)(parseInt(req.params.id, 10));
    if (objCampaign === null || objCampaign === undefined) {
        return res.status(200).json({
            success: false,
            msg: 'Campaña no válida o no existe',
            item: []
        });
    }
    const servers = yield (0, mailconfig_model_1.getServersActive)();
    const cantRecords = yield (0, campaign_model_1.getBaseActive)(objCampaign.id);
    if (objCampaign.role === 'PROCESANDO') {
        return res.status(400).json({
            success: false,
            msg: 'La campaña ya está en play',
            item: []
        });
    }
    console.log('Servidores activos: ', servers.length);
    console.log('Cant', cantRecords);
    if (cantRecords <= 0) {
        return res.status(200).json({
            success: false,
            msg: 'NO hay registros por enviar',
            item: []
        });
    }
    let serversId = servers.map((s) => {
        return s.id;
    });
    serversId = serversId.sort(() => {
        return 0.5 - Math.random();
    });
    console.log('Servers ID:', serversId);
    const jobs = Math.ceil(cantRecords / 20);
    console.log('Jobs:', jobs);
    let inicio = 0, fin = 25, limite = 25;
    for (let server of serversId) {
        console.log('Servidor: ', server, 'Inicio: ', inicio, 'Fin: ', fin);
        const recipients = yield (0, campaign_model_1.getCampaignBase)(objCampaign.id, inicio, limite);
        inicio += fin;
        fin += limite;
        let peticion = {
            id: objCampaign.id,
            name: objCampaign.name,
            template: objCampaign.idTemplate,
            subject: objCampaign.subject,
            recipients: recipients,
            idServer: server
        };
        (0, email_utils_1.sendEmails)(peticion);
    }
    return res.status(200).json({
        success: true,
        msg: 'Tareas iniciadas, se ejecutaran ' + jobs + ' partes.',
        item: []
    });
});
exports.playCampaign = playCampaign;
//# sourceMappingURL=campaign.controller.js.map