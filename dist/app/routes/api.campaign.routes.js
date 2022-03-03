'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const controller = require("../controllers/campaign.controller");
module.exports = function (app) {
    app.route('/campaign').post(controller.createCampaign);
};
//# sourceMappingURL=api.campaign.routes.js.map