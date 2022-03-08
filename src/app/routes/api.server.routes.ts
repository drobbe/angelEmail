'use strict';

import { getMetrics } from '../controllers/metrics.server.controller';
import {
    authenticate,
    resolveToken,
    resolveSecret
} from '../controllers/auth.server.controller';
import { helloWorld } from '../controllers/api.server.controller';
import { previewFile } from '../controllers/file.controller';

module.exports = function (app) {
    app.route('/hello').post(authenticate, helloWorld);

    app.route('/hello').get(resolveToken, resolveSecret, helloWorld);

    app.route('/test').get(helloWorld);

    app.route('/preview').post(previewFile);

    app.route('/metrics').get(getMetrics);

    // Set params if needed
    // app.param('Id', apiCtrl.func);
};
