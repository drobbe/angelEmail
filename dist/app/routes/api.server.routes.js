'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const metrics_server_controller_1 = require("../controllers/metrics.server.controller");
const auth_server_controller_1 = require("../controllers/auth.server.controller");
const api_server_controller_1 = require("../controllers/api.server.controller");
const file_controller_1 = require("../controllers/file.controller");
module.exports = function (app) {
    app.route('/hello').post(auth_server_controller_1.authenticate, api_server_controller_1.helloWorld);
    app.route('/hello').get(auth_server_controller_1.resolveToken, auth_server_controller_1.resolveSecret, api_server_controller_1.helloWorld);
    app.route('/test').get(api_server_controller_1.helloWorld);
    app.route('/preview').get(file_controller_1.previewFile);
    app.route('/preview').post(file_controller_1.previewFile);
    app.route('/metrics').get(metrics_server_controller_1.getMetrics);
};
//# sourceMappingURL=api.server.routes.js.map