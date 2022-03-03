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
exports.insertDataEmail = exports.insertCampaign = void 0;
const connection_1 = require("../connection");
const insertCampaign = (campaign) => __awaiter(void 0, void 0, void 0, function* () {
    console.log({ campaign });
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
//# sourceMappingURL=campaign.model.js.map