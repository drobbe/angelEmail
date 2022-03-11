import { Request, Response } from 'express';
import {
    getCampaignsClient,
    insertCampaign,
    insertDataEmail,
    getCampaign,
    getCampaignBase,
    getBaseActive,
    getCampaignsClientDateFilter,
    setStateCampaign,
    getCountBasePending,
    getRangeEmails
} from '../db/models/campaign.model';
import { getServersActive } from '../db/models/server.model';
import { cleanJobsByCampaign, createJobs } from '../db/models/job.model';
import { sendEmails } from '../utils/email.utils';

import { log } from '../utils/error.utils';
import { getDataXlsx } from './file.controller';
const jobsUtil = require('../utils/job.util');

const limitByServer = parseInt(process.env.LIMIT_BY_SERVER, 10) || 100;

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
        schedule: req.body.schedule,
        emailReponse: req.body.emailReponse
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
    const idClient = Number(req.headers.idclient);
    let campaigns = null;
    if (
        req.query && // 👈 null and undefined check
        Object.keys(req.query).length === 0 &&
        Object.getPrototypeOf(req.query) === Object.prototype
    ) {
        campaigns = await getCampaignsClient(idClient);
    } else {
        campaigns = await getCampaignsClientDateFilter(idClient, req.query);
    }

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
export const playCampaignOld = async (req: Request, res: Response) => {
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

    if (objCampaign.status === 'PROCESANDO') {
        return res.status(400).json({
            success: false,
            msg: 'La campaña ya está en play',
            item: []
        });
    }

    console.log('Servidores activos: ', servers.length);
    console.log('Cant. Registros: ', cantRecords);

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

    console.log('Servers IDs:', serversId);
    const jobs = Math.ceil(cantRecords / 20);
    console.log('Jobs:', jobs);
    let inicio = 0,
        fin = 25,
        limite = 25;

    if (cantRecords <= limite) {
        console.log('Menos del limite.');
        serversId = [serversId[0]];
        console.log('Servidores: ', serversId);
    }

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
        // if (cantRecords > fin) {
        let peticion = {
            id: objCampaign.id,
            name: objCampaign.name,
            template: objCampaign.idTemplate,
            subject: objCampaign.subject,
            recipients: recipients,
            idServer: server
        };

        sendEmails(peticion);
        // } else {
        //	console.log('Mas de los obtenidos');
        //	return false;
        // }
    } // );

    return res.status(200).json({
        success: true,
        msg: 'Tareas iniciadas, se ejecutaran ' + jobs + ' partes.',
        item: []
    });
};

// eslint-disable-next-line require-await
// eslint-disable-next-line complexity
export const playCampaign = async (req: Request, res: Response) => {
    try {
        let idCampaign = req.params.id;
        if (
            idCampaign === undefined ||
            idCampaign === null ||
            idCampaign === ''
        ) {
            console.log('Falta el id de la campaña');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Faltan lso datos requeridos.'
            });
        }

        let objCampaign = await getCampaign(idCampaign);
        if (objCampaign === null) {
            console.log('Campaña no válida o no existe');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Campaña no válida o no existe.'
            });
        }
        if (objCampaign.status === 'PROCESANDO') {
            console.log('Campaña ya esta en play');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Error, la campaña ya se está ejecuntando.'
            });
        }
        if (objCampaign.status !== 'PAUSADO') {
            console.log('Campaña en etatus no valido (%s)', objCampaign.status);
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Error, la campaña posee un estado no válido para dar play.'
            });
        }

        const cantPendientes = await getCountBasePending(idCampaign);
        console.log('Pendientes:', cantPendientes);
        if ((<any>cantPendientes).count <= 0 || cantPendientes <= 0) {
            console.log('Campaña no tiene registros por enviar');
            await setStateCampaign(
                idCampaign,
                'TERMINADO',
                'Terminado por no tener pendientes.'
            );
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Error, la campaña no posee resgistros pendientes por enviar.'
            });
        }

        const lstServers = await getServersActive();
        const cantServer = lstServers.length;
        if (!cantServer) {
            console.log('-NO- hay servidores disponibles');
            await setStateCampaign(
                idCampaign,
                'PAUSADO',
                'Pausado por no haber servidores disponibles.'
            );
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Error, los servicios no estan diponibles, favor intente más tarde.'
            });
        }

        let jobs = Math.ceil(cantPendientes / limitByServer);
        let jobsByServer = Math.ceil(jobs / cantServer);
        console.log('');
        console.log(
            '=========================================================================='
        );
        console.log(
            '===> Records (%s), limit by server (%s), jobs (%s), by server (%s) <===',
            cantPendientes,
            limitByServer,
            jobs,
            jobsByServer
        );
        console.log(
            '========================================================================='
        );
        console.log('');

        let lstIdServers = lstServers.map((s) => s.id);
        if (lstIdServers.length > 1) {
            lstIdServers = lstIdServers.sort(() => {
                return 0.5 - Math.random();
            });
            console.log('');
            console.log(
                '=========================================================================='
            );
            console.log('Salida IDs aleatorios: ', lstIdServers);
            console.log(
                '========================================================================='
            );
            console.log('');
        }
        let lstJobs = [],
            inicio = 0;
        for (let j = 1; j <= jobsByServer; j++) {
            // console.log('Job: ', j);
            for (let s in lstIdServers) {
                if (inicio < cantPendientes) {
                    const rangeIdRecords = await getRangeEmails({
                        idCampaign: objCampaign.id,
                        inicio,
                        limitByServer
                    });
                    console.log('Rangos: ', rangeIdRecords);
                    // eslint-disable-next-line max-depth
                    if (rangeIdRecords === null) {
                        console.log('No hay rangos.');
                        return false;
                    }

                    // eslint-disable-next-line max-depth
                    if (
                        (<any>rangeIdRecords).inicio === null ||
                        (<any>rangeIdRecords).hasta === null
                    ) {
                        console.log('No tiene rangos.');
                        return false;
                    }

                    lstJobs.push([
                        objCampaign.id,
                        lstIdServers[s],
                        0,
                        (<any>rangeIdRecords).inicio,
                        (<any>rangeIdRecords).hasta
                    ]);
                    inicio += limitByServer;
                }
            }
        }

        if (lstJobs.length) {
            console.log('');
            console.log(
                '=========================================================================='
            );
            console.log('Iniciar (%s) trabajos', lstJobs.length);
            await cleanJobsByCampaign(objCampaign.id);
            console.log('Limpieza...');
            const resultCreate = await createJobs(lstJobs);
            console.log('Create: ', resultCreate);
            if ((<any>resultCreate).count > 0) {
                console.log('¡¡Jobs creados!!');
                await setStateCampaign(
                    idCampaign,
                    'PROCESANDO',
                    'Procesando por orden de play de la API.'
                );
                console.log('Iniciando...');
                jobsUtil.startJobs();
                console.log(
                    '=========================================================================='
                );
                console.log('');
                return res.status(200).json({
                    success: true,
                    items: [],
                    msg: 'Campaña iniciada con éxito'
                });
            }
            console.log('Sin trabajos');
        } else {
            await setStateCampaign(
                idCampaign,
                'PAUSADO',
                'Sin trabajos que crear'
            );
            console.log('NO hay trabajos a ejecutar');
            console.log(
                '=========================================================================='
            );
            console.log('');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Error, no se pudo iniciar'
            });
        }
    } catch (errors) {
        console.log(errors);
        console.log('contoller.campaigns.playCampaign:', errors.message);
        return res.status(500).json({
            success: false,
            msg: errors.message
        });
    }
};

export const pauseCampaign = async (req: Request, res: Response) => {
    try {
        let idCampaign = req.params.id;
        if (
            idCampaign === undefined ||
            idCampaign === null ||
            idCampaign === ''
        ) {
            console.log('Falta el id de la campaña');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Faltan lso datos requeridos.'
            });
        }

        let objCampaign = await getCampaign(idCampaign);
        if (objCampaign === null) {
            console.log('Campaña no válida o no existe');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Campaña no válida o no existe.'
            });
        }
        if (objCampaign.status === 'PAUSADO') {
            console.log('Campaña ya esta en pausada');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Error, la campaña ya está pausada.'
            });
        }

        await setStateCampaign(
            idCampaign,
            'PAUSADO',
            'Pausado por orden de la api.'
        );
        await cleanJobsByCampaign(idCampaign);

        return res.status(200).json({
            success: true,
            items: [],
            msg: 'Campaña pausada con éxito'
        });
    } catch (errors) {
        console.log(errors);
        console.log('contoller.campaigns.pauseCampaign:', errors.message);
        return res.status(500).json({
            success: false,
            msg: errors.message
        });
    }
};
