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
    getRangeEmails,
    getDataCampaign,
    getAvailable
} from '../db/models/campaign.model';
import { getServersActive } from '../db/models/server.model';
import { cleanJobsByCampaign, createJobs } from '../db/models/job.model';
import { sendEmails } from '../utils/email.utils';

import { log } from '../utils/error.utils';
import { getDataXlsx } from './file.controller';
import { getTemplate } from '../db/models/template.model';
const moment = require('moment-timezone');
const jobsUtil = require('../utils/job.util');
const Excel = require('exceljs');

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
        emailReponse: req.body.emailReponse,
        sender: req.body.sender,
        finalDate: req.body.finalDate
    });

    const path = './' + req.file.path.replace('\\', '/');

    let dataExcel = await getDataXlsx(path);

    dataExcel = dataExcel.map((row) => {
        for (let k in row) {
            if (
                k.replace(/\s/g, '') !== k &&
                Object.prototype.hasOwnProperty.call(row, k)
            ) {
                row[k.replace(/\s/g, '')] = row[k];
                delete row[k];
            }
        }

        // eslint-disable-next-line guard-for-in
        for (let k in row) {
            if (Object.prototype.hasOwnProperty.call(row, k)) {
                let upper = k.toUpperCase();
                if (upper !== k) {
                    row[upper] = row[k];
                    delete row[k];
                }
            }
        }

        let email =
            row[
                Object.keys(row).find((key) => {
                    return key.match(/^email$/i);
                })
            ];
        let indentity =
            row[
                Object.keys(row).find((key) => {
                    return key.match(/^identificacion$/i);
                })
            ];
        let fullName =
            row[
                Object.keys(row).find((key) => {
                    return key.match(/^nombre$/i);
                })
            ];

        email = email === undefined ? '' : email.toString();
        indentity = indentity === undefined ? '' : indentity.toString();
        fullName = fullName === undefined ? '' : fullName.toString();

        return {
            idCampaign: insert.id,
            email: email,
            indentity: indentity,
            fullName: fullName,
            customVariables: JSON.stringify(row)
        };
    });

    console.log(dataExcel);

    await insertDataEmail(dataExcel);

    log('info', {
        msg: insert
    });

    log('info', {
        msg: 'Se ha creado correctamente la campa??a ' + req.body.name
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
        req.query && // ???? null and undefined check
        Object.keys(req.query).length === 0 &&
        Object.getPrototypeOf(req.query) === Object.prototype
    ) {
        campaigns = await getCampaignsClient(idClient);
    } else {
        campaigns = await getCampaignsClientDateFilter(idClient, req.query);
    }

    log('info', {
        msg: 'Listado con ??xito'
    });

    return res.status(200).json({
        message: 'Todo OK',
        status: true,
        data: campaigns
    });
};

export const countCampaignAvailable = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const data = await getAvailable(id);

    log('info', {
        msg: 'Listado con ??xito'
    });

    return res.status(200).json({
        message: 'Todo OK',
        status: true,
        data: data
    });
};

// eslint-disable-next-line require-await
export const playCampaignOld = async (req: Request, res: Response) => {
    console.log('Require: ', req.params);
    const objCampaign = await getCampaign(parseInt(req.params.id, 10));

    if (objCampaign === null || objCampaign === undefined) {
        return res.status(200).json({
            success: false,
            msg: 'Campa??a no v??lida o no existe',
            item: []
        });
    }

    const servers = await getServersActive();
    const cantRecords = await getBaseActive(objCampaign.id);

    if (objCampaign.status === 'PROCESANDO') {
        return res.status(400).json({
            success: false,
            msg: 'La campa??a ya est?? en play',
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

export const deleteCampaign = async (req: Request, res: Response) => {
    try {
        let idCampaign = req.params.id;
        if (
            idCampaign === undefined ||
            idCampaign === null ||
            idCampaign === ''
        ) {
            console.log('Falta el id de la campa??a');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Faltan los datos requeridos.'
            });
        }
        await setStateCampaign(
            idCampaign,
            'ELIMINADO',
            'ELIMINADO por orden de la api.'
        );

        return res.status(200).json({
            success: true,
            items: [],
            msg: 'Campa??a Eliminada con ??xito'
        });
    } catch (errors) {
        console.log(errors);
        console.log('contoller.campaigns.playCampaign:', errors.message);
        return res.status(500).json({
            success: false,
            msg: errors.message
        });
    }
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
            console.log('Falta el id de la campa??a');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Faltan lso datos requeridos.'
            });
        }

        let objCampaign = await getCampaign(idCampaign);
        if (objCampaign === null) {
            console.log('Campa??a no v??lida o no existe');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Campa??a no v??lida o no existe.'
            });
        }
        if (objCampaign.status === 'PROCESANDO') {
            console.log('Campa??a ya esta en play');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Error, la campa??a ya se est?? ejecuntando.'
            });
        }
        if (
            objCampaign.status !== 'PAUSADO' &&
            objCampaign.status !== 'CARGADA'
        ) {
            console.log('Campa??a en etatus no valido (%s)', objCampaign.status);
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Error, la campa??a posee un estado no v??lido para dar play.'
            });
        }

        const cantPendientes = await getCountBasePending(idCampaign);
        console.log('Pendientes:', cantPendientes);
        if ((<any>cantPendientes).count <= 0 || cantPendientes <= 0) {
            console.log('Campa??a no tiene registros por enviar');
            await setStateCampaign(
                idCampaign,
                'COMPLETADO',
                'COMPLETADO por no tener pendientes.'
            );
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Error, la campa??a no posee resgistros pendientes por enviar.'
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
                msg: 'Error, los servicios no estan diponibles, favor intente m??s tarde.'
            });
        }

        let jobs = Math.ceil(cantPendientes / limitByServer);
        let jobsByServer = Math.ceil(jobs / cantServer);
        let estimacion = Math.round(((cantPendientes * 60) / 100) * cantServer);
        console.log('Estimacion: ', estimacion);
        let horas = Math.floor(estimacion / 3600);
        // eslint-disable-next-line no-mixed-operators
        let uno = horas * 3600;
        let minutos = Math.floor((estimacion - uno) / 60);
        let dos = minutos * 60;
        let segundos = estimacion - uno - dos;
        console.log('Horas: ', horas);
        console.log('Minutos: ', minutos);
        console.log('Segundos: ', segundos);
        let mensajeEstimacion =
            ', Tiempo estimado para envidar (' +
            cantPendientes +
            ') registros es de: ';
        if (horas > 0) mensajeEstimacion += horas + ' hora(s)';
        if (minutos > 0) mensajeEstimacion += minutos + ' minutos';
        mensajeEstimacion += segundos + ' segundos';
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
            'Estimacion: %s:%s:%s',
            horas.toString().padStart(2, '0'),
            minutos.toString().padStart(2, '0'),
            segundos.toString().padStart(2, '0')
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
                console.log('????Jobs creados!!');
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
                    msg: 'Campa??a iniciada con ??xito' + mensajeEstimacion
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

export const playCampaignWithoutRquest = async (idCampaign: number) => {
    try {
        let objCampaign = await getCampaign(idCampaign);
        if (objCampaign === null) {
            console.log('Campa??a no v??lida o no existe');
            return {
                success: false,
                items: [],
                msg: 'Campa??a no v??lida o no existe.'
            };
        }
        if (objCampaign.status === 'PROCESANDO') {
            console.log('Campa??a ya esta en play');
            return {
                success: false,
                items: [],
                msg: 'Error, la campa??a ya se est?? ejecuntando.'
            };
        }
        if (
            objCampaign.status !== 'PAUSADO' &&
            objCampaign.status !== 'CARGADA'
        ) {
            console.log('Campa??a en etatus no valido (%s)', objCampaign.status);
            return {
                success: false,
                items: [],
                msg: 'Error, la campa??a posee un estado no v??lido para dar play.'
            };
        }

        const cantPendientes = await getCountBasePending(idCampaign);
        console.log('Pendientes:', cantPendientes);
        if ((<any>cantPendientes).count <= 0 || cantPendientes <= 0) {
            console.log('Campa??a no tiene registros por enviar');
            await setStateCampaign(
                idCampaign,
                'COMPLETADO',
                'COMPLETADO por no tener pendientes.'
            );
            return {
                success: false,
                items: [],
                msg: 'Error, la campa??a no posee resgistros pendientes por enviar.'
            };
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
            return {
                success: false,
                items: [],
                msg: 'Error, los servicios no estan diponibles, favor intente m??s tarde.'
            };
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
                console.log('????Jobs creados!!');
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
                return {
                    success: true,
                    items: [],
                    msg: 'Campa??a iniciada con ??xito'
                };
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
            return {
                success: false,
                items: [],
                msg: 'Error, no se pudo iniciar'
            };
        }
    } catch (errors) {
        console.log(errors);
        console.log('contoller.campaigns.playCampaign:', errors.message);
        return {
            success: false,
            msg: errors.message
        };
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
            console.log('Falta el id de la campa??a');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Faltan los datos requeridos.'
            });
        }

        let objCampaign = await getCampaign(idCampaign);
        if (objCampaign === null) {
            console.log('Campa??a no v??lida o no existe');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Campa??a no v??lida o no existe.'
            });
        }
        if (objCampaign.status === 'PAUSADO') {
            console.log('Campa??a ya esta en pausada');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Error, la campa??a ya est?? pausada.'
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
            msg: 'Campa??a pausada con ??xito'
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

const convertDateExcel = (excelDate) => {
    const unixTime = (excelDate - 25569) * 86400 * 1000;
    return new Date(unixTime);
};

export const exportCampaign = async (req: Request, res: Response) => {
    try {
        let idCampaign = req.params.id;
        if (
            idCampaign === undefined ||
            idCampaign === null ||
            idCampaign === ''
        ) {
            console.log('Falta el id de la campa??a');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Faltan lso datos requeridos.'
            });
        }

        let objCampaign = await getCampaign(idCampaign);
        if (objCampaign === null) {
            console.log('Campa??a no v??lida o no existe');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Campa??a no v??lida o no existe.'
            });
        }

        if (
            objCampaign.status === 'PROCESANDO' ||
            objCampaign.status === 'CARGADA'
        ) {
            console.log('Campa??a no v??lida o no existe');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'La campa??a debe estar en pausa o finalizada para poder extraer informaci??n.'
            });
        }

        const template = await getTemplate(objCampaign.idTemplate);
        const datosCampania = await getDataCampaign(idCampaign);

        let templateVars = JSON.parse(
            template.customVariables.replace(/\|\|/g, '')
        );
        console.log('Exportar (%s) registros.', datosCampania.length);

        if (!datosCampania.length) {
            console.log('Sin datos para exportar');
            return res.status(200).json({
                success: false,
                items: [],
                msg: 'Sin informaci??n a procesar.'
            });
        }

        console.log(templateVars.map((o) => o.replace(/\s+/g, '_')));

        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet('Reporte de ejecuci??n');
        let columnas = [
            {
                header: 'campa??a',
                key: 'campaign',
                width: 20
            },
            {
                header: 'identificacion',
                key: 'identity',
                width: 20
            },
            {
                header: 'nombre destinatario',
                key: 'fullName',
                width: 20
            },
            {
                header: 'email',
                key: 'email',
                width: 20
            },
            {
                header: 'estado env??o',
                key: 'sent_state',
                width: 20
            },
            {
                header: 'fecha/hora',
                key: 'sent_date',
                width: 15
            }
        ];
        const variablesExcluidas = ['IDENTIFICACION', 'NOMBRE', 'EMAIL'];
        // eslint-disable-next-line guard-for-in
        for (let p in templateVars) {
            let variable = templateVars[p];

            if (variablesExcluidas.includes(variable.toUpperCase())) {
                console.log('Eliminar (%s) por exclusion', variable);
                delete templateVars[p];
            } else {
                columnas.push({
                    header: variable.toString().toLowerCase(),
                    key: variable.toString(),
                    width: 25
                });
            }
        }

        console.log('Template vars: ', templateVars);
        worksheet.columns = columnas;

        // eslint-disable-next-line guard-for-in
        for (let d in datosCampania) {
            let registro = datosCampania[d];
            let datos = JSON.parse(registro.customVariables);
            // console.log('Variables registro: ', datos);
            let item = {
                campaign: objCampaign.name,
                identity: registro.indentity,
                fullName: registro.fullName,
                email: registro.email
            };

            let resultado = 'NO ENVIADO';
            let fechaEnvio = '';
            // eslint-disable-next-line max-depth
            if (registro.isSent === true) {
                resultado = 'ENVIADO';
                fechaEnvio = registro.sentDate.toISOString();
                fechaEnvio = moment(fechaEnvio).format('DD-MM-YYYY HH:mm:SS');
            }

            // eslint-disable-next-line max-depth
            if (registro.isSent !== true && registro.error === true) {
                resultado =
                    'NO ENVIADO - Problemas con el env??o, con nuestros servers.';
            }

            // eslint-disable-next-line max-depth
            if (registro.isValid === false) {
                resultado = 'CORREO INV??LIDO';
            }

            item['sent_state'] = resultado;
            item['sent_date'] = fechaEnvio;

            // eslint-disable-next-line guard-for-in
            for (let v in templateVars) {
                let campo = templateVars[v];
                /*
                if (variablesExcluidas.includes(campo.toUpperCase())) {
                    console.log('Excluido: ', campo);
                    return false;
                }
				*/
                if (/^4\d{4}/.test(datos[campo])) {
                    datos[campo] = moment(
                        convertDateExcel(datos[campo]).toISOString()
                    ).format('DD-MM-YYYY');
                }

                if (datos[campo] !== undefined) {
                    item[campo] = datos[campo].toString();
                } else {
                    item[campo] = '';
                }
            }

            // console.log('Registro: ', item);

            worksheet.addRow(item);
        }

        let fileName =
            objCampaign.name.toLowerCase().replace(/\s+/g, '_') +
            '_reporte.xlsx';

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + fileName
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (errors) {
        console.log(errors);
        console.log('contoller.campaigns.exportCampaign:', errors.message);
        return res.status(500).json({
            success: false,
            msg: errors.message
        });
    }
};
