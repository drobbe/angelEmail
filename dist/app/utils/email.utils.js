"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmails = void 0;
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const templates = require('./template.utils');
const isEmail_1 = require("validator/lib/isEmail");
const mailconfig_model_1 = require("../db/models/mailconfig.model");
const template_model_1 = require("../db/models/template.model");
const campaign_model_1 = require("../db/models/campaign.model");
const createTransport = (idServer) => __awaiter(void 0, void 0, void 0, function* () {
    const server = yield (0, mailconfig_model_1.getServer)(idServer);
    console.log('Server:', server);
    const config = JSON.parse(server.config);
    const sender = JSON.parse(server.sender);
    if (config.type === 'SMTP') {
        return [
            sender,
            nodemailer.createTransport({
                pool: true,
                maxConnections: Number(config.maxConnections),
                maxMessages: Number(config.maxMessages),
                host: config.host,
                port: Number(config.port),
                secure: Boolean(config.secure),
                auth: {
                    user: config.auth.user,
                    pass: config.auth.pass
                },
                tls: { rejectUnauthorized: false }
            })
        ];
    }
    else if (config.type === 'GMAIL') {
        return [
            sender,
            nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: config.auth.user,
                    pass: config.auth.pass
                }
            })
        ];
    }
});
const sendEmails = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = yield createTransport(data.idServer);
    const recipients = data.recipients;
    const sender = transporter[0];
    const templateData = yield (0, template_model_1.getTemplate)(data.template);
    let enviados = 0, noEnviados = 0;
    if (recipients.length) {
        console.log('Enviar: ', recipients.length, 'Servidor: ', data.idServer);
        recipients.forEach((recipient) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if ((0, isEmail_1.default)(recipient.email)) {
                    let mail = {
                        from: '"' + sender.name + '" <' + sender.email + '>',
                        to: '"' +
                            recipient.fullName +
                            '" <' +
                            recipient.email +
                            '>',
                        subject: data.subject,
                        html: templates.makeHtml(templateData, JSON.parse(recipient.customVariables)),
                        dsn: {
                            id: uuidv4(),
                            return: 'headers',
                            notify: ['failure'],
                            recipient: sender.email
                        }
                    };
                    let info = yield transporter[1].sendMail(mail);
                    console.log('Message sent (%s), server (%s): %s ', recipient.email, data.idServer, info.messageId);
                    (0, campaign_model_1.setBaseStatus)(recipient.id, {
                        isSent: 1,
                        sentId: info.messageId,
                        error: 0,
                        errorMessage: null
                    });
                    enviados += 1;
                }
                else {
                    console.log(recipient.email + ' - Dirección no válida');
                    (0, campaign_model_1.setBaseStatus)(recipient.id, {
                        isSent: 0,
                        sentId: null,
                        error: 1,
                        errorMessage: 'E-mail (' + recipient.email + ') no válido'
                    });
                    noEnviados += 1;
                }
            }
            catch (error) {
                console.log('ERROR (%s): %s', recipient.email, error.message);
                (0, campaign_model_1.setBaseStatus)(recipient.id, {
                    isSent: 0,
                    sentId: null,
                    error: 1,
                    errorMessage: error.message
                });
                noEnviados += 1;
            }
        }));
    }
    return [true, enviados, noEnviados];
});
exports.sendEmails = sendEmails;
//# sourceMappingURL=email.utils.js.map