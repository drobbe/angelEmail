const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const templates = require('./template.utils');
const isEmail = require('validator/lib/isEmail');

const { getTemplate } = require('../db/models/template.model');
const { getServer, setServerBusy } = require('../db/models/server.model');
const {
    setStateCampaign,
    checkCampaignFinalized,
    setBaseStatus
} = require('../db/models/campaign.model');
const { setJobStatus } = require('../db/models/job.model');
let colas = [],
    errores = 0;

const createTransport = async (idServer) => {
    try {
        const server = await getServer(idServer);
        if (server === undefined || server === null) {
            console.log('No se encontró servdior de correo.');
            return null;
        }

        let config = server.config;
        if (typeof server.config === 'string')
            config = JSON.parse(server.config);
        let sender = server.sender;
        if (typeof server.sender === 'string')
            sender = JSON.parse(server.sender);

        console.log('');
        console.log('================> Servidor <================');
        console.log('Id:   ', server.id);
        console.log('Name: ', server.name);
        console.log('Host: ', config.host);
        console.log('================> Sender <================');
        console.log('Name:   ', sender.name);
        console.log('Email:  ', sender.email);
        console.log('============================================');
        console.log('');

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
        }
        return null;
    } catch (errors) {
        console.log();
        console.log('utils.email.createTransport:', errors.message);
        return null;
    }
};

export const sendEmails = async (data) => {
    try {
        // console.log('Send e-mails: ',data);
        const transporter = await createTransport(data.idServer);
        if (transporter === null) {
            console.log('Falta transporter.');
            return false;
        }

        let procesados = 0;
        const recipients = data.recipients;
        if (!recipients.length) {
            console.log('Falta destinatarios.');
            // await checkList(data.idServer, data.idJob, data.id);
            // await validaProcesados(data.idJob, procesados);
            await setJobStatus(data.idJob, 2);
            return false;
        }

        // cantLista = recipients.length;

        const sender = transporter[0];
        const templateData = await getTemplate(data.template);

        console.log(
            'Destinatarios: ',
            recipients.length,
            'Servidor: ',
            data.idServer
        );
        await setServerBusy(data.idServer, 1);

        console.log('Colas: ', colas);

        if (colas.find((c) => c.id === data.idJob) === undefined) {
            console.log('Agregando a la cola....');
            colas.push({
                id: data.idJob,
                cantidad: recipients.length,
                idServer: data.idServer,
                idCampaign: data.id,
                campaign: data.name
            });
        }

        recipients.forEach(async (recipient) => {
            try {
                procesados += 1;
                if (isEmail(recipient.email)) {
                    console.log(
                        'Enviando (%s) por el servidor (%s) con la tarea (%s)',
                        recipient.email,
                        data.idServer,
                        data.idJob
                    );
                    let variablesRecipient = JSON.parse(
                        recipient.customVariables
                    );
                    let templateHtmlData = templates.makeHtml(
                        templateData,
                        variablesRecipient
                    );
                    if (
                        templateHtmlData === null ||
                        templateHtmlData === 'null'
                    ) {
                        console.log('Template vacío.');
                        return false;
                    }

                    let mail = {
                        from: '"' + data.name + '" <' + sender.email + '>', // sender address
                        to:
                            '"' +
                            recipient.fullName +
                            '" <' +
                            recipient.email +
                            '>',
                        subject: data.subject, // Subject line
                        html: templateHtmlData, // html body
                        dsn: {
                            id: uuidv4(),
                            return: 'headers',
                            notify: ['failure'],
                            recipient: sender.email
                        }
                    };

                    if (
                        data.replyTo !== undefined &&
                        data.replyTo !== '' &&
                        data.replyTo !== null &&
                        isEmail(data.replyTo)
                    ) {
                        console.log('Seteando replyTo (%s)', data.replyTo);
                        mail['replyTo'] = data.replyTo;

                        console.log('Enmascarar email');
                        mail['from'] =
                            '"' + data.name + '" <' + data.replyTo + '>';
                    }

                    let sendInfo = await transporter[1].sendMail(mail);
                    console.log(
                        'Message sent (%s), server (%s), job (%s): %s ',
                        recipient.email,
                        data.idServer,
                        data.idJob,
                        sendInfo.messageId
                    );

                    const fechaEnvio = new Date().toISOString();

                    setBaseStatus(recipient.id, {
                        isSent: true,
                        sentId: sendInfo.messageId,
                        sentDate: fechaEnvio,
                        isValid: true,
                        error: false,
                        errorMessage: null,
                        server: data.idServer
                    });
                    // eslint-disable-next-line no-use-before-define
                    await validaProcesados(data.idJob, procesados);
                    // await checkList(data.idServer, data.idJob, data.id);
                } else {
                    console.log(
                        'ERROR (%s): %s',
                        recipient.email,
                        'Dirección de e-mail no válida'
                    );
                    setBaseStatus(recipient.id, {
                        isSent: false,
                        sentId: null,
                        sentDate: null,
                        error: true,
                        isValid: false,
                        errorMessage:
                            'Dirección de e-mail (' +
                            recipient.email +
                            ') no válida',
                        server: data.idServer
                    });

                    // eslint-disable-next-line no-use-before-define
                    await validaProcesados(data.idJob, procesados);
                    errores += 1;

                    // await checkList(data.idServer, data.idJob, data.id);
                }
            } catch (error) {
                console.log(
                    'ERROR al intentar enviar (%s): (%s)',
                    recipient.email,
                    error.message
                );
                // noEnviados += 1;
                setBaseStatus(recipient.id, {
                    isSent: false,
                    sentId: null,
                    sentDate: null,
                    isValid: true,
                    error: true,
                    errorMessage: error.message,
                    server: data.idServer
                });
                errores += 1;
                // eslint-disable-next-line no-use-before-define
                await validaProcesados(data.idJob, procesados);
                // await checkList(data.idServer, data.idJob, data.id);
                return false;
            }
        });
    } catch (errors) {
        await setServerBusy(data.idServer, 0);
        await setStateCampaign(
            data.id,
            'PAUSADO',
            'Pausa desde error de SendEmails'
        );
        console.log('utils.email.sendEmails:', errors.message);
    }
};

const validaProcesados = async (idJob, procesados) => {
    try {
        console.log('');
        console.log(
            '========================================================='
        );
        const item = colas.find((t) => t.id === idJob);
        // console.log('Item: ', item);
        if (item !== undefined) {
            const icola = colas.indexOf((r) => r.id === idJob);
            // console.log('I Cola: ', icola);
            console.log(
                '=========> Procesados (%s) de (%s) by server (%s) <=========',
                procesados,
                item.cantidad,
                item.idServer
            );
            const porcentaje = Math.ceil(item.cantidad * 0.25);
            console.log('25 % de (%s) es (%s)', item.cantidad, porcentaje);
            if (item.cantidad === procesados) {
                console.log(
                    '(%s) Completada (%s) *************',
                    idJob,
                    procesados
                );
                await setJobStatus(idJob, 2);
                await setServerBusy(item.idServer, 0);
                if (icola !== -1) delete colas[icola];
                await checkCampaignFinalized(item.idCampaign);
            } else if (item.cantidad < procesados) {
                console.log('(%s) Sobrepasa *************', idJob);
                await setServerBusy(item.idServer, 0);
                await setJobStatus(idJob, 2);
                if (icola !== -1) delete colas[icola];
            } else if (errores >= porcentaje) {
                if (icola !== -1) delete colas[icola];
                await setServerBusy(item.idServer, 0);
                // console.log('Demasiados errores.');
                await setStateCampaign(
                    item.idCampaign,
                    'PAUSADO',
                    'Pausado por demasiados errores.'
                );
            }
            console.log('<============================');
        }
    } catch (errors) {
        console.log(errors);
    }
};
