'use strict';

import * as controller from '../controllers/campaign.controller';

module.exports = function (app) {
    app.route('/campaign').post(controller.createCampaign);
    app.route('/campaigns').get(controller.listCampaign);
    app.route('/campaign/play/:id').get(controller.playCampaign);
    app.route('/campaign/pause/:id').get(controller.pauseCampaign);
    app.route('/campaign/delete/:id').get(controller.deleteCampaign);
    app.route('/campaign/available/:id').get(controller.countCampaignAvailable);
    app.route('/campaign/export/:id').get(controller.exportCampaign);
};
