'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const controller = require("../controllers/campaign.controller");
module.exports = function (app) {
    app.route('/campaign').post(controller.createCampaign);
    app.route('/campaigns').get(controller.listCampaign);
    app.route('/campaign/play/:id').get(controller.playCampaign);
};
//# sourceMappingURL=api.campaign.routes.js.map