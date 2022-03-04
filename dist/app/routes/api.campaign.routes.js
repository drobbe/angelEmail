'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const controller = require("../controllers/campaign.controller");
module.exports = function (app) {
    app.route('/campaign').post(controller.createCampaign);
    app.route('/campaigns').get(controller.listCampaign);
};
//# sourceMappingURL=api.campaign.routes.js.map