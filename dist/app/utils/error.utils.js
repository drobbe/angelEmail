"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const { Tags } = require('opentracing');
const config_1 = require("../../config/config");
const logger = require('winston');
let transports = [];
let dateStr = new Date().toISOString().substring(0, 9);
if (config_1.config.toggle.log.files) {
    transports.push(new logger.transports.File({
        filename: 'logs/' + dateStr + '-error.log',
        level: 'error'
    }));
    transports.push(new logger.transports.File({
        filename: 'logs/' + dateStr + '-info.log',
        level: 'info'
    }));
}
if (config_1.config.toggle.log.console) {
    transports.push(new logger.transports.Console());
}
logger.configure({
    transports: transports
});
const log = function (level, payload, span = undefined, tagObj = undefined) {
    if (span && tagObj) {
        for (let tag in tagObj) {
            if (Object.prototype.hasOwnProperty.call(tagObj, tag)) {
                span.setTag(tag, tagObj[tag]);
            }
        }
    }
    if (span && level === 'error') {
        span.setTag(Tags.ERROR, true);
    }
    logger.log(level, payload);
    if (span) {
        span.log(payload);
    }
};
exports.log = log;
//# sourceMappingURL=error.utils.js.map