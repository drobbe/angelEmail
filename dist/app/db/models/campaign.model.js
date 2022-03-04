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
exports.getBaseActive = exports.setBaseStatus = exports.getCampaignBase = exports.getCampaign = exports.insertDataEmail = exports.getCampaignsClient = exports.insertCampaign = void 0;
const connection_1 = require("../connection");
const insertCampaign = (campaign) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield connection_1.default.campaign.create({
            data: {
                client: Number(campaign.client),
                name: campaign.name,
                subject: campaign.subject,
                idTemplate: Number(campaign.idTemplate),
                schedule: Boolean(Number(campaign.schedule))
            }
        });
        return data;
    }
    catch (error) {
        console.log(error);
    }
});
exports.insertCampaign = insertCampaign;
const getCampaignsClient = (idClient) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield connection_1.default.campaign.findMany({
            where: {
                client: idClient,
                NOT: {
                    role: 'ELIMINADO'
                }
            }
        });
        return data;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getCampaignsClient = getCampaignsClient;
const insertDataEmail = (dataEmail) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield connection_1.default.dataEmail.createMany({
            data: dataEmail
        });
        return data;
    }
    catch (error) {
        console.log(error);
    }
});
exports.insertDataEmail = insertDataEmail;
const getCampaign = (campaign) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield connection_1.default.campaign.findUnique({
            where: {
                id: campaign
            }
        });
        return data;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getCampaign = getCampaign;
const getCampaignBase = (campaign, start, end) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = end ? Number(end) : 10;
        const offset = start ? Number(start) : 0;
        const data = yield connection_1.default.dataEmail.findMany({
            where: {
                idCampaign: campaign,
                isSent: 0,
                error: 0
            },
            take: limit,
            skip: offset,
            orderBy: {
                id: 'asc'
            }
        });
        return data;
    }
    catch (error) {
        console.error(error);
    }
});
exports.getCampaignBase = getCampaignBase;
const setBaseStatus = (record, dataEmail) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idRecord = Number(record);
        const datos = yield connection_1.default.dataEmail.update({
            where: {
                id: idRecord
            },
            data: {
                isSent: Number(dataEmail.isSent),
                sentId: dataEmail.sentId,
                error: Number(dataEmail.error),
                errorMessage: dataEmail.errorMessage
            }
        });
        return datos;
    }
    catch (error) {
        console.error(error);
    }
});
exports.setBaseStatus = setBaseStatus;
const getBaseActive = (campaign) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield connection_1.default.dataEmail.count({
            where: {
                idCampaign: campaign,
                isSent: 0,
                error: 0
            }
        });
        return data;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getBaseActive = getBaseActive;
//# sourceMappingURL=campaign.model.js.map