'use strict';

import * as controller from '../controllers/template.controller';

module.exports = function (app) {
    app.route('/templates').get(controller.getTemplates);
    app.route('/templates/enabled').get(controller.getTemplatesEnabled);
    app.route('/template').post(controller.createTemplate);
    app.route('/template/:id').put(controller.editTemplate);
    app.route('/template/enable/:id').get(controller.enableTemplate);
    app.route('/template/disable/:id').get(controller.disableTemplate);
    app.route('/template/:id').delete(controller.deleteTemplate);
    app.route('/template/duplicate').post(controller.duplicateTemplate);
};
