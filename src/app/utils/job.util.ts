const heartbeats = require('heartbeats');
import { sendEmails } from './email.utils';
import {
    releaseAllServerForce,
    releaseAllServers,
    getServersActive
} from '../db/models/server.model';
import {
    getCampaign,
    getCampaignsActive,
    setStateCampaign,
    getCampaignRecipients,
    getCountBasePending
} from '../db/models/campaign.model';
import {
    setJobStatus,
    setJobStart,
    getOneJobByServer,
    getJobsByCampaing
} from '../db/models/job.model';

const maxIntentos = 3;
let intento = 0;
const intelvals = parseInt(process.env.INTERVALS, 10) || 4500;
let heart;

export const cleanServers = async () => {
    try {
        await releaseAllServerForce();
    } catch (errors) {
        console.log(errors);
        console.log('utils.jobs.cleanServers: ', errors.message);
    }
};

// eslint-disable-next-line require-await
const stopJobs = async () => {
    try {
        console.log('Deteniendo...');
        if (heart !== undefined) {
            heart.kill();
            heart = undefined;
        }
    } catch (errors) {
        console.log(errors);
        console.log('utils.jobs.stopJob: ', errors.message);
    }
};

const createJob = async (job) => {
    try {
        // console.log('Ejecutar: ', job);
        const campania = await getCampaign(job.idCampaign);
        // console.log(campania);
        if (campania.status === 'PROCESANDO') {
            // console.log('Campaña activa (%s)', campania.name);
            const recipients = await getCampaignRecipients({
                campaign: campania.id,
                desde: job.start,
                hasta: job.end
            });
            // console.log('Destinatarios: ', recipients);
            if (!(<any>recipients).length) {
                console.log(
                    'Campaña (%s) no tiene destinatarios.',
                    campania.name
                );
                await setJobStatus(job.id, 2);
                return false;
            }

            // console.log('Activando trabajo.');
            await setJobStart(job.id, campania.id, job.idServer);

            let peticion = {
                id: campania.id,
                name: campania.name,
                template: campania.idTemplate,
                subject: campania.subject,
                recipients: recipients,
                idServer: job.idServer,
                idJob: job.id
            };

            sendEmails(peticion);
        } else if (
            campania.status !== 'PAUSADO' &&
            campania.status !== 'COMPLETADO'
        ) {
            console.log('Campaña (%s) no está en play.', campania.name);
            await setStateCampaign(
                campania.id,
                'PAUSADO',
                'Pausado por tener un estatus diferente al play'
            );
        } else {
            console.log('Estatus: ', campania.status);
        }
    } catch (errors) {
        console.log(errors);
        console.log('utils.jobs.createJob: ', errors.message);
    }
};

const checkJobs = async () => {
    try {
        console.log('Validando...');
        const campaniasActivas = await getCampaignsActive();
        const servidoresActivos = await getServersActive();
        let servidoresLibres = [];

        if (!campaniasActivas.length) {
            console.log('No hay campañas activas');
            // await cleanAllJobs();
            await releaseAllServers();
            // intento += 1;
            return false;
        }

        intento = 0;

        if (servidoresActivos.length) {
            servidoresLibres = servidoresActivos.filter(
                (s) => s.busy === false
            );
        }

        console.log('Campañas activas (%s)', campaniasActivas.length);

        // eslint-disable-next-line guard-for-in
        for (let c in campaniasActivas) {
            const campania = campaniasActivas[c];
            const cuenta = await getCountBasePending(campania.id);
            console.log(
                'Campaña %s tiene (%s) registros pendientes por enviar.',
                campania.name,
                cuenta
            );

            const tieneJobs = await getJobsByCampaing(campania.id);
            console.log('Tiene (%s)', campania.id, tieneJobs);
            if ((<any>tieneJobs).count <= 0 || tieneJobs <= 0) {
                console.log('La campaña no tiene trabajos, detener...');
                await setStateCampaign(
                    campania.id,
                    'PAUSADO',
                    'Pausar porque no tiene tareas creadas'
                );
                return false;
            }

            if (cuenta <= 0) {
                console.log(
                    'Campaña %s no tiene registros pendientes por enviar, pausando...',
                    campania.name
                );
                await setStateCampaign(
                    campania.id,
                    'PAUSADO',
                    'No tiene registros pendientes'
                );
                return false;
            }
        }

        console.log(
            'Servidores activos (%s), libres (%s)',
            servidoresActivos.length,
            servidoresLibres.length
        );

        if (servidoresLibres.length) {
            servidoresLibres.forEach(async (servidorLibre) => {
                // console.log('Libre: ', servidorLibre);
                let job = await getOneJobByServer(servidorLibre.id);
                // console.log('JOB: ', job);
                console.log('Servidor (%s), (%s)', servidorLibre.name, job);
                if (job !== null) {
                    console.log('Crear tarea: ', job);
                    await createJob(job);
                } else {
                    console.log('No hay trabajos disponibles.');
                }
            });
        }
    } catch (errors) {
        console.log(errors);
        console.log('utils.jobs.checkJobs: ', errors.message);
    }
};

// eslint-disable-next-line require-await
export const startJobs = async () => {
    try {
        if (heart === undefined) {
            heart = heartbeats.createHeart(intelvals);
            heart.createEvent(1, async (count, last) => {
                console.log('Count (%s), last (%s)', count, last);
                // console.log('Interval - (%s)', Date.toString());
                intento += 1;
                console.log('Intento #%s.', intento);
                await checkJobs();
                if (intento >= maxIntentos) return stopJobs();
            });
            heart.createPulse();
        } else {
            console.log('Ya activos');
        }

        return heart;
    } catch (errors) {
        console.log(errors);
        console.log('utils.jobs.startJobs: ', errors.message);
    }
};
