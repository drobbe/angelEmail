"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloWorld = void 0;
const helloWorld = function (req, res) {
    return res.status(200).json({
        message: 'Hello World!'
    });
};
exports.helloWorld = helloWorld;
//# sourceMappingURL=api.server.controller.js.map