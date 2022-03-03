'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeJWT = exports.verifyJWT = exports.signJWT = void 0;
const path = require('path'), fs = require('fs');
const jwt = require('jsonwebtoken');
let config = require('../../config/config');
let privateKEY = fs.readFileSync(path.join(__dirname, '../../../creds/jwtRS512.key'), 'utf8'), publicKEY = fs.readFileSync(path.join(__dirname, '../../../creds/jwtRS512.key.pub'), 'utf8');
const signJWT = function (payload, $Options) {
    let signOptions = {
        issuer: $Options.issuer || config.jwt.issuer,
        expiresIn: '30d',
        algorithm: 'RS512',
        subject: $Options.subject || undefined,
        audience: $Options.audience || undefined
    };
    return jwt.sign(payload, privateKEY, signOptions);
};
exports.signJWT = signJWT;
const verifyJWT = function (token, $Options) {
    let verifyOptions = {
        issuer: $Options.issuer || config.jwt.issuer,
        subject: $Options.subject || undefined,
        audience: $Options.audience || undefined,
        expiresIn: '30d',
        algorithm: ['RS512']
    };
    try {
        return jwt.verify(token, publicKEY, verifyOptions);
    }
    catch (err) {
        return false;
    }
};
exports.verifyJWT = verifyJWT;
const decodeJWT = function (token) {
    return jwt.decode(token, { complete: true });
};
exports.decodeJWT = decodeJWT;
//# sourceMappingURL=auth.utils.js.map