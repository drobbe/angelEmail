'use strict';

import * as controller from '../controllers/campaign.controller';

module.exports = function (app) {
    app.route('/campaign').post(controller.createCampaign);
    app.route('/campaigns').get(controller.listCampaign);
};
