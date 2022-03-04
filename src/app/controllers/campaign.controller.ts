import { Request, Response } from 'express';
import {
    getCampaignsClient,
    insertCampaign,
    insertDataEmail,
    getCampaign,
    getCampaignBase,
    getBaseActive
} from '../db/models/campaign.model';
import { getServersActive } from '../db/models/mailconfig.model';
import { sendEmails } from '../utils/email.utils';

import { log } from '../utils/error.utils';
import { getDataXlsx } from './file.controller';

/**
 * SAMPLE FUNCTION - CAN BE REMOVED
 * @param req Request
 * @param res Response
 */
export const createCampaign = async (req: any, res: Response) => {
    // console.log(req.file);

    const insert = await insertCampaign({
        client: req.body.client,
        name: req.body.name,
        subject: req.body.subject,
        idTemplate: req.body.idTemplate,
        schedule: req.body.schedule
    });

    const path = './' + req.file.path.replace('\\', '/');

    let dataExcel = await getDataXlsx(path);

    dataExcel = dataExcel.map((row) => {
        return {
            idCampaign: insert.id,
            email: row.EMAIL.toString(),
            indentity: row.IDENTIFICACION.toString(),
            fullName: row.NOMBRE.toString(),
            customVariables: JSON.stringify(row)
        };
    });

    await insertDataEmail(dataExcel);

    log('info', {
        msg: insert
    });

    log('info', {
        msg: 'Se ha creado correctamente la campaña ' + req.body.name
    });

    return res.status(201).json({
        message: 'Todo OK',
        status: true,
        data: insert
    });
};

export const listCampaign = async (req: Request, res: Response) => {
    console.log(req.headers.idclient);
    const idClient = Number(req.headers.idclient);
    const campaigns = await getCampaignsClient(idClient);

    log('info', {
        msg: 'Listado con éxito'
    });

    return res.status(200).json({
        message: 'Todo OK',
        status: true,
        data: campaigns
    });
};

// eslint-disable-next-line require-await
export const playCampaign = async (req: Request, res: Response) => {
    console.log('Require: ', req.params);
    const objCampaign = await getCampaign(parseInt(req.params.id, 10));

    if (objCampaign === null || objCampaign === undefined) {
        return res.status(200).json({
            success: false,
            msg: 'Campaña no válida o no existe',
            item: []
        });
    }

    const servers = await getServersActive();
    const cantRecords = await getBaseActive(objCampaign.id);

    if (objCampaign.role === 'PROCESANDO') {
        return res.status(400).json({
            success: false,
            msg: 'La campaña ya está en play',
            item: []
        });
    }

    console.log('Servidores activos: ', servers.length);
    console.log('Cant', cantRecords);

    if (cantRecords <= 0) {
        return res.status(200).json({
            success: false,
            msg: 'NO hay registros por enviar',
            item: []
        });
    }

    let serversId = servers.map((s) => {
        return s.id;
    });

    serversId = serversId.sort(() => {
        return 0.5 - Math.random();
    });

    console.log('Servers ID:', serversId);
    const jobs = Math.ceil(cantRecords / 20);
    console.log('Jobs:', jobs);
    let inicio = 0,
        fin = 25,
        limite = 25;

    // serversId.forEach(async (server) => {
    for (let server of serversId) {
        console.log('Servidor: ', server, 'Inicio: ', inicio, 'Fin: ', fin);
        const recipients = await getCampaignBase(
            objCampaign.id,
            inicio,
            limite
        );
        // console.log('Recipients: ', recipients);
        inicio += fin;
        fin += limite;

        let peticion = {
            id: objCampaign.id,
            name: objCampaign.name,
            template: objCampaign.idTemplate,
            subject: objCampaign.subject,
            recipients: recipients,
            idServer: server
        };

        sendEmails(peticion);
    } // );

    return res.status(200).json({
        success: true,
        msg: 'Tareas iniciadas, se ejecutaran ' + jobs + ' partes.',
        item: []
    });
};
