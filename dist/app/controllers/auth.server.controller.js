"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAPICredentials = exports.resolveSecret = exports.resolveToken = exports.authenticate = void 0;
let config = require('../../config/config');
const error_utils_1 = require("../utils/error.utils");
const auth_utils_1 = require("../utils/auth.utils");
const authenticate = function (req, res, next) {
    if (req.headers.authorization === config.authorization) {
        next();
    }
    else {
        return res.status(400).jsonp({
            message: 'You may be unauthorized to do this request! Please add the token'
        });
    }
};
exports.authenticate = authenticate;
const resolveToken = function (req, res, next) {
    let token = req.headers.authorization;
    let decoded = (0, auth_utils_1.verifyJWT)(token, {});
    if (!decoded) {
        return res.status(401).send({
            message: 'Invalid access. Sign in / validate your token'
        });
    }
    let shouldAllow = true;
    (0, error_utils_1.log)('info', {
        message: 'Resolving token',
        decoded: decoded
    });
    if (shouldAllow) {
        next();
    }
    else {
        return res.status(401).send({
            message: 'Invalid access.'
        });
    }
};
exports.resolveToken = resolveToken;
const resolveSecret = function (req, res, next) {
    let secret = req.headers.secret;
    let shouldAllow = true;
    if (shouldAllow && secret) {
        next();
    }
    else {
        return res.status(401).send({
            message: 'Invalid access.'
        });
    }
};
exports.resolveSecret = resolveSecret;
const generateAPICredentials = function (req, res) {
    let shouldAllow = true;
    if (shouldAllow) {
        let token = (0, auth_utils_1.signJWT)(req.body, {});
        return res.status(200).jsonp({
            token: token
        });
    }
    return res.status(500).jsonp({
        error: 'Cannot read end point credentials'
    });
};
exports.generateAPICredentials = generateAPICredentials;
//# sourceMappingURL=auth.server.controller.js.map