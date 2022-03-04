const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const templates = require('./template.utils');
import isEmail from 'validator/lib/isEmail';
import { getServer } from '../db/models/mailconfig.model';
import { getTemplate } from '../db/models/template.model';
import { setBaseStatus } from '../db/models/campaign.model';

// eslint-disable-next-line require-await
/* eslint no-else-return: "error" */
const createTransport = async (idServer) => {
    // const rs = await db.query('SELECT * FROM email_config WHERE client_id = ?', [data.clientId]);
    const server = await getServer(idServer);
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
                secure: Boolean(config.secure), // true for 465, false for other ports
                auth: {
                    user: config.auth.user, // generated ethereal user
                    pass: config.auth.pass // generated ethereal password
                },
                tls: { rejectUnauthorized: false }
            })
        ];
    } else if (config.type === 'GMAIL') {
        return [
            sender,
            nodemailer.createTransport({
                service: 'gmail', // true for 465, false for other ports
                auth: {
                    user: config.auth.user, // generated ethereal user
                    pass: config.auth.pass // generated ethereal password
                }
            })
        ];
    }
};

export const sendEmails = async (data: any) => {
    const transporter = await createTransport(data.idServer);
    // console.log('Sender:', sender);
    const recipients = data.recipients;
    const sender = transporter[0];
    const templateData = await getTemplate(data.template);
    let enviados = 0,
        noEnviados = 0;

    if (recipients.length) {
        console.log('Enviar: ', recipients.length, 'Servidor: ', data.idServer);
        recipients.forEach(async (recipient) => {
            try {
                if (isEmail(recipient.email)) {
                    let mail = {
                        from: '"' + sender.name + '" <' + sender.email + '>', // sender address
                        to:
                            '"' +
                            recipient.fullName +
                            '" <' +
                            recipient.email +
                            '>',
                        subject: data.subject, // Subject line
                        html: templates.makeHtml(
                            templateData,
                            JSON.parse(recipient.customVariables)
                        ), // html body
                        dsn: {
                            id: uuidv4(),
                            return: 'headers',
                            notify: ['failure'],
                            recipient: sender.email
                        }
                    };
                    // console.log('Email to: ', mail);
                    let info = await transporter[1].sendMail(mail);
                    console.log(
                        'Message sent (%s), server (%s): %s ',
                        recipient.email,
                        data.idServer,
                        info.messageId
                    );

                    setBaseStatus(recipient.id, {
                        isSent: 1,
                        sentId: info.messageId,
                        error: 0,
                        errorMessage: null
                    });

                    enviados += 1;
                } else {
                    console.log(recipient.email + ' - Dirección no válida');
                    setBaseStatus(recipient.id, {
                        isSent: 0,
                        sentId: null,
                        error: 1,
                        errorMessage:
                            'E-mail (' + recipient.email + ') no válido'
                    });

                    noEnviados += 1;
                }
            } catch (error) {
                console.log('ERROR (%s): %s', recipient.email, error.message);
                setBaseStatus(recipient.id, {
                    isSent: 0,
                    sentId: null,
                    error: 1,
                    errorMessage: error.message
                });
                noEnviados += 1;
            }
        });
    }

    return [true, enviados, noEnviados];
};
